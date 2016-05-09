/*eslint
  camelcase: [0, {"properties": "never"}],
  max-statements: [2, 36],
  max-nested-callbacks: [2, 4],
  complexity: [2, 20],
  no-invalid-this: 0
*/
import knex from "knex";
import Boom from "boom";
import assert from "assert";
import _ from "lodash";
import { db } from "./config";

const client = knex(db);

export default client;

export const resolveOr404 = (promise, label = "resource") => {
  return promise.then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`no such ${label}`);
    } else {
      return rows[0];
    }
  });
};

export const hackathonStatus = (hackathon) => {
  const { start_at: startAt, end_at: endAt } = hackathon;
  const now = new Date();
  let status;
  if (startAt <= now) {
    if (endAt) {
      if (endAt > now) {
        status = "active";
      } else {
        status = "completed";
      }
    } else {
      status = "ongoing";
    }
  } else {
    status = "not_started";
  }
  return status;
};

export const getHackathon = (id, opts = {allowDeleted: false}) => {
  const participantCount = client.select()
    .count("participants.hackathon_id")
    .from("participants")
    .where("participants.hackathon_id", "=", id)
    .as("participants");
  const projectCount = client.select()
    .count("projects.hackathon_id")
    .from("projects")
    .where("projects.hackathon_id", "=", id)
    .as("projects");

  const whereClause = {
    id,
    deleted: false
  };

  if (opts.allowDeleted) {
    delete whereClause.deleted;
  }

  const mainQuery = client("hackathons")
    .select("*", participantCount, projectCount)
    .from("hackathons")
    .where(whereClause);

  const adminQuery = client("users")
    .select("users.*")
    .join("hackathon_admins", "users.id", "=", "hackathon_admins.user_id")
    .where("hackathon_admins.hackathon_id", id);

  return Promise.all([mainQuery, adminQuery]).then(([hackathonRows, admins]) => {
    const hackathon = hackathonRows[0];
    if (hackathon) {
      hackathon.admins = admins;
      hackathon.status = hackathonStatus(hackathon);
    }
    return hackathon;
  });
};

export const ensureHackathon = (id, opts = {
  checkOwner: false,
  checkPublished: false,
  allowDeleted: false
}) => {
  return getHackathon(id, {allowDeleted: opts.allowDeleted}).then((result) => {
    if (!result) {
      throw Boom.notFound(`No hackathon with id ${id} was found`);
    }

    const userId = opts.checkOwner || opts.checkPublished;
    const hasOwner = result.admins.some((user) => user.id === userId);

    if (opts.checkPublished && !result.is_published && !hasOwner) {
      throw Boom.notFound(`No hackathon with id ${id} was found`);
    }

    if (opts.checkOwner && !hasOwner) {
      throw Boom.forbidden(`You must be a hackathon admin to do this`);
    }

    return result;
  });
};

export const ensureProject = (hackathonId, id, opts = {
  checkOwner: false,
  checkMember: false,
  allowDeleted: false,
  includeOwner: false
}) => {
  // our count subqueries
  const likesCount = client.select()
    .count("likes.project_id")
    .from("likes")
    .where("likes.project_id", "=", id)
    .as("likes");
  const sharesCount = client.select()
    .count("shares.project_id")
    .from("shares")
    .where("shares.project_id", "=", id)
    .as("shares");
  const viewsCount = client.select()
    .count("views.project_id")
    .from("views")
    .where("views.project_id", "=", id)
    .as("views");

  // our main aggregate query
  const projectQuery = client("projects")
    .select("projects.*", likesCount, sharesCount, viewsCount)
    .where({"projects.id": id});

  if (opts.includeOwner) {
    projectQuery
      .select("users.name as owner_name")
      .innerJoin("users", "projects.owner_id", "users.id");
  }

  // member query which we'll use to augment project results
  const memberQuery = client("users").distinct().select("users.*")
    .leftOuterJoin("members", "members.user_id", "=", "users.id")
    .where("members.project_id", "=", id)
    .andWhere("members.hackathon_id", "=", hackathonId);

  return Promise.all([
    projectQuery,
    memberQuery
  ]).then(([projectResult, members]) => {
    const project = projectResult[0];

    if (!project || project.deleted && !opts.allowDeleted) {
      throw Boom.notFound(`No project ${id} exists.`);
    } else if (project.hackathon_id !== hackathonId) {
      throw Boom.notFound(`No project with id ${id} was found in hackathon ${hackathonId}.`);
    } else if (opts.checkOwner && project.owner_id !== opts.checkOwner) {
      throw Boom.forbidden(`You must be the project owner to modify it`);
    }

    if (opts.checkMember && !members.some((member) => member.id === opts.checkMember)) {
      throw Boom.forbidden("you must be a project member to do this");
    }

    project.members = members;

    return project;
  });
};

export const ensureComment = (projectId, id, opts = {checkOwner: false}) => {
  return client("comments").where({id}).then((rows) => {
    const comment = rows[0];

    if (!comment) {
      throw Boom.notFound(`No comment ${id} exists.`);
    } else if (comment.project_id !== projectId) {
      throw Boom.notFound(`No comment with id ${id} was found in project ${projectId}.`);
    } else if (opts.checkOwner && comment.user_id !== opts.checkOwner) {
      throw Boom.forbidden(`You must have created the comment to modify it`);
    }
  });
};

export const ensureUser = (userId, opts = {allowDeleted: false}) => {
  const query = {
    deleted: false,
    id: userId
  };
  if (opts.allowDeleted) {
    delete query.deleted;
  }

  const statQuery = function (table) {
    return client.select()
      .count("*")
      .from(table)
      .innerJoin("members", "members.project_id", `${table}.project_id`)
      .where("members.user_id", userId)
      .as(table);
  };

  const userQuery = client("users")
    .select("*", statQuery("likes"), statQuery("shares"), statQuery("views"))
    .where(query);

  return userQuery.then((users) => {
    const user = users[0];

    if (!user || user && user.deleted && !opts.allowDeleted) {
      throw Boom.notFound(`User id ${userId} was not found.`);
    }

    const participationQuery = client("hackathons")
      .join("participants")
      .select("hackathons.id")
      .whereRaw("hackathons.id = participants.hackathon_id")
      .where({"hackathons.is_published": true})
      .where("participants.user_id", user.id);

    return participationQuery.then((hackathons) => {
      user.hackathons_part_of = [];
      for (const hackathon of hackathons) {
        user.hackathons_part_of.push(hackathon.id);
      }
      return user;
    });
  });
};

export const ensureParticipant = (hackathonId, userId, opts = {includeUser: false}) => {
  return client("participants").where({user_id: userId, hackathon_id: hackathonId}).then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`User id ${userId} was not found in hackathon ${hackathonId}.`);
    }
    return rows[0];
  }).then((participant) => {
    if (!opts.includeUser) {
      return participant;
    }

    return ensureUser(userId).then((user) => {
      for (const key in user) {
        participant[key] = user[key];
      }
      return participant;
    });
  });
};

export const paginate = (query, {limit, offset}) => {
  assert(typeof limit === "number", "Must pass a numeric 'limit' to 'paginate' method");
  assert(typeof limit === "number", "Must pass a numeric 'offset' to 'paginate' method");
  const countQuery = query.clone();

  // delete any specific columns mentioned by the query for our count query
  // otherwise we can create a query that MySQL doesn't consider to be valid
  // when we add the `.count()` to it.
  countQuery._statements.some((statement, index) => {
    if (statement.grouping === "columns") {
      countQuery._statements.splice(index, 1);
      return true;
    }
  });
  return Promise.all([
    countQuery.count(),
    query
      .limit(limit)
      .offset(offset)
  ]).then((res) => {
    const data = res[1];
    return {
      offset,
      limit,
      result_count: data.length,
      total_count: res[0][0]["count(*)"],
      data
    };
  });
};

// we use this for two different routes so it lives here for re-use
export const projectSearch = (queryObj) => {
  const {
    hackathon_id, search, include_deleted, has_video, country,
    needed_roles, needed_expertise, product_focus, customer_type, has_member,
    has_challenges, sort_col, sort_direction
  } = queryObj;

  const query = client("projects")
    .join("hackathons", "projects.hackathon_id", "=", "hackathons.id")
    .innerJoin("users", "projects.owner_id", "users.id")
    .andWhere(include_deleted ? {} : {"projects.deleted": false});

  if (hackathon_id) {
    query.where("projects.hackathon_id", hackathon_id);
  }

  if (search) {
    query.where(function () {
      this.where("projects.title", "like", `%${search}%`)
        .orWhere("projects.json_tags", "like", `%${search}%`)
        .orWhere("projects.tagline", "like", `%${search}%`);
    });
  }

  if (has_member) {
    query.whereIn("projects.id", function () {
      this.select("project_id")
        .from("members")
        .where("user_id", has_member);
    });
  }

  if (has_video === false || has_video === true) {
    if (has_video) {
      query.whereNotNull("projects.video_id");
    } else {
      query.whereNull("projects.video_id");
    }
  }
  const checkBoolean = (col) => {
    const val = queryObj[col];
    if (val === false || val === true) {
      query.andWhere(`projects.${col}`, val);
    }
  };
  checkBoolean("needs_hackers");
  checkBoolean("writing_code");
  checkBoolean("existing");
  checkBoolean("external_customers");
  if (needed_roles && needed_roles.length) {
    query.where(function () {
      needed_roles.forEach((role, index) => {
        // first time through we want to call `where`
        // then subsequesntly use `orWhere`
        const fnName = index === 0 ? "where" : "orWhere";
        this[fnName]("projects.json_needed_roles", "like", `%${role}%`);
      });
    });
  }
  if (needed_expertise && needed_expertise.length) {
    query.where(function () {
      needed_expertise.forEach((expertise, index) => {
        // first time through we want to call `where`
        // then subsequesntly use `orWhere`
        const fnName = index === 0 ? "where" : "orWhere";
        this[fnName]("projects.json_needed_expertise", "like", `%${expertise}%`);
      });
    });
  }
  if (has_challenges && has_challenges.length) {
    query.where(function () {
      has_challenges.forEach((expertise, index) => {
        // first time through we want to call `where`
        // then subsequesntly use `orWhere`
        const fnName = index === 0 ? "where" : "orWhere";
        this[fnName]("projects.json_executive_challenges", "like", `%${expertise}%`);
      });
    });
  }
  if (product_focus && product_focus.length) {
    query.whereIn("projects.product_focus", product_focus);
  }
  if (customer_type && customer_type.length) {
    query.whereIn("projects.customer_type", customer_type);
  }
  if (country && country.length) {
    query.whereIn("hackathons.country", country);
  }

  const orderByCol = sort_col || "created_at";
  const orderByDirection = sort_direction || "desc";
  if (sort_col === "owner_alias") {
    query.orderBy(`users.alias`, orderByDirection);
  } else {
    query.orderBy(`projects.${orderByCol}`, orderByDirection);
  }

  query.select("projects.*", "users.name as owner_name", "users.alias as owner_alias");
  return query;
};

const addMembersToProjects = (projects, usersByProject) => {
  return _.map(projects, (project) => {
    if (usersByProject[project.id]) {
      project.team_size = usersByProject[project.id].length;
      project.members = _.map(usersByProject[project.id], (user) =>
        _.pick(user, ["id", "name", "alias"]));
    }
    return project;
  });
};

export const addProjectMembersToPagination = (paginationQuery) => {
  return paginationQuery.then((pagination) => {
    const projectIds = _.pluck(pagination.data, "id");
    const membersQuery = client("members")
      .select("members.project_id", "users.id", "users.name", "users.alias")
      .innerJoin("users", "members.user_id", "users.id")
      .whereIn("members.project_id", projectIds);

    return membersQuery.then((users) => {
      const usersByProject = _.groupBy(users, "project_id");
      pagination.data = addMembersToProjects(pagination.data, usersByProject);
      return pagination;
    });
  });
};

export const addProjectUrlsToPagination = (paginationQuery, hackathonId) => {
  return paginationQuery.then((pagination) => {
    pagination.data = _.map(pagination.data, (project) => {
      project.project_url =
        `https://garagehackbox.azurewebsites.net/hackathons/${hackathonId}/projects/${project.id}`;
      return project;
    });
    return pagination;
  });
};

export const userSearch = (queryObj) => {
  const {
    search, hackathon_id, has_project, include_deleted,
    role, product_focus, country, sort_col, sort_direction
  } = queryObj;

  const orderByCol = sort_col || "given_name";
  const orderByDirection = sort_direction || "asc";
  let query;

  if (hackathon_id) {
    /*
      It would be nice to have this all written using knex's query building
      capabilities, but I had trouble doing so.

      The important thing to understand is that query creates a derived
      table that contains user data with two additional fields:
        - the related `participants.json_participation_meta`
        - a derived field called 'has_project` that is coerced into a boolean

      The reason it's written as `client.select().joinRaw(` rather than just
      using `client.raw()` is because the latter doesn't allow for modifying
      the query as we do later. For example, when using knex.raw `query.where`
      isn't a function.

      Also, please note that `has_project` only works when passing a `hackathon_id`
      to scope it. This is enforced at the route level.
    */
    let rawQuery = [
      "select distinct users.*, participants.json_participation_meta, participants.joined_at,",
      "(select case when exists",
      "(select * from members where members.user_id = users.id and members.hackathon_id = ?)",
      "then true else false end)",
      "as has_project from users",
      "inner join participants on participants.user_id = users.id",
      "where participants.hackathon_id = ?"
    ].join(" ");
    const rawQueryVars = [hackathon_id, hackathon_id];

    /*
      We need to sort by joined_at in the query that includes participants
      since this query is used to create a derived table from which we have
      no reference to the participants table.

      We have to concat the orderByDirection because `joinRaw()` turns the
      direction into a string like `'asc'`if we pass it as a ?. Instead, let's
      just double check the value is legit even though it should have already
      been verified in the route.
    */
    if (orderByCol === "joined_at" && _.includes(["asc", "desc"], orderByDirection)) {
      rawQuery += ` order by participants.joined_at ${orderByDirection}`;
    }

    query = client.select().joinRaw(`from (${rawQuery}) as derived`, rawQueryVars);
  } else {
    query = client("users");
  }

  if (!include_deleted) {
    query.andWhere("deleted", false);
  }
  if (search) {
    query.where(function () {
      this.where("name", "like", `%${search}%`)
        .orWhere("email", "like", `%${search}%`)
        .orWhere("bio", "like", `%${search}%`)
        .orWhere("json_working_on", "like", `%${search}%`)
        .orWhere("json_expertise", "like", `%${search}%`)
        .orWhere("json_interests", "like", `%${search}%`);
    });
  }
  if (role && role.length) {
    query.whereIn("primary_role", role);
  }
  if (product_focus && product_focus.length) {
    query.whereIn("product_focus", product_focus);
  }
  if (country && country.length) {
    query.whereIn("country", country);
  }
  if (has_project === true || has_project === false) {
    query.andWhere("has_project", has_project);
  }

  // order by joined_at happens in the hackathon rawQuery above
  if (orderByCol === "given_name") {
    query.orderByRaw(`given_name ${orderByDirection}, family_name ${orderByDirection}`);
  } else if (orderByCol === "family_name") {
    query.orderByRaw(`family_name ${orderByDirection}, given_name ${orderByDirection}`);
  }

  return query;
};

export const hackathonSearch = (queryObj) => {
  const {
    include_deleted, include_unpublished, country,
    admins_contain, participants_contain, search, sort_col, sort_direction
  } = queryObj;

  // we don't include all fields
  // because some of them could be quite large
  const columns = [
    "hackathons.id",
    "hackathons.name",
    "hackathons.slug",
    "hackathons.logo_url",
    "hackathons.start_at",
    "hackathons.end_at",
    "hackathons.org",
    "hackathons.city",
    "hackathons.country",
    "hackathons.tagline",
    "hackathons.color_scheme",
    "hackathons.created_at",
    "hackathons.updated_at",
    "hackathons.deleted",
    "hackathons.is_public",
    "hackathons.is_published",
    "hackathons.json_meta"
  ];

  const query = client.select(columns).from("hackathons");

  if (search) {
    query.where(function () {
      this.where("name", "like", `%${search}%`)
        .orWhere("slug", "like", `%${search}%`)
        .orWhere("tagline", "like", `%${search}%`);
    });
  }

  if (!include_unpublished) {
    query.andWhere({is_published: true});
  }

  if (!include_deleted) {
    query.andWhere({"hackathons.deleted": false});
  }

  if (admins_contain) {
    query.whereIn("hackathons.id", function () {
      this.select("hackathon_id")
        .from("hackathon_admins")
        .where("user_id", admins_contain);
    });
  }

  if (participants_contain) {
    query.joinRaw([
      "left outer join (",
      "select hackathon_id, user_id",
      "from participants group by hackathon_id",
      ") current_participants on current_participants.user_id =",
      `\"${participants_contain}\"`
    ].join(" "))
    .whereRaw("current_participants.hackathon_id = hackathons.id");
  }

  if (country && country.length) {
    query.whereIn("country", country);
  }

  // include participants
  query.joinRaw([
    "left outer join (",
    "select hackathon_id, count(*) as count",
    "from participants group by hackathon_id",
    ") participants_c on hackathons.id = participants_c.hackathon_id"
  ].join(" "))
    .select(knex.raw("IFNULL(participants_c.count, 0) as participants"));

  // include projects
  query.joinRaw([
    "left outer join (",
    "select hackathon_id, count(*) as count",
    "from projects group by hackathon_id",
    ") projects_c on hackathons.id = projects_c.hackathon_id"
  ].join(" "))
    .select(knex.raw("IFNULL(projects_c.count, 0) as projects"));

  // calculate status
  query.select(knex.raw([
    "IF(start_at <= NOW(),",
    "IF(end_at,",
    "IF(end_at > NOW(), \"active\", \"completed\"),",
    "\"ongoing\"),",
    "\"not_started\") as status"
  ].join(" ")));

  let orderByCol = sort_col;
  let orderByDirection = sort_direction;
  if (!orderByCol) {
    orderByCol = "created_at";
    orderByDirection = "desc";
  }
  if (!orderByDirection || !_.includes(["asc", "desc"], orderByDirection)) {
    if (_.includes(["projects", "participants"], orderByCol)) {
      orderByDirection = "desc";
    } else {
      orderByDirection = "asc";
    }
  }
  if (orderByCol === "status") {
    /*
      Status sorts in the following order:
      1. Active- Hackathons that are within the starting and end date. (Amount of
         time left should show first)
      2. Ongoing- These are hackathon that have a start date but not an end date.
         (The hackathons with the most amount of time elapsed should show first)
      3. Not started- These are hackathons where the beginning date hasn’t happened
         yet. (The ones that are coming up the soonest should show first)
      4. Completed- These are hackathons where the end date has already happened.
         (The ones most recently completed should show first)
    */
    let statusOrder = ["'active'", "'ongoing'", "'not_started'", "'completed'"];
    if (orderByDirection === "desc") {
      statusOrder = statusOrder.reverse();
    }
    query
      .orderByRaw(`FIELD(status, ${statusOrder.join(", ")})`)
      .orderBy("end_at", orderByDirection)
      .orderBy("start_at", orderByDirection);
  } else if (orderByCol === "end_at") {
    // sort nulls last
    query
      .orderByRaw("CASE WHEN end_at IS NULL THEN 1 ELSE 0 END")
      .orderBy(orderByCol, orderByDirection);
  } else {
    query.orderBy(orderByCol, orderByDirection);
  }

  return query;
};

export const ensureAward = (hackathonId, id, opts = {includeCategories: false}) => {
  const awardQuery = client("awards")
    .select("*")
    .where({hackathon_id: hackathonId, id});
  const awardCategoriesQuery = client("awards_award_categories")
    .innerJoin(
      "award_categories",
      "awards_award_categories.award_category_id",
      "=",
      "award_categories.id"
    )
    .where("awards_award_categories.award_id", id)
    .select("award_categories.*");

  return Promise.all([
    awardQuery,
    opts.includeCategories ? awardCategoriesQuery : null
  ]).then(([awards, awardCategories]) => {
    const award = awards[0];
    if (!award) {
      throw Boom.notFound(`No award ${id} exists.`);
    }
    if (opts.includeCategories) {
      award.award_categories = awardCategories || [];
    }
    return award;
  });
};

export const awardSearch = (hackathonId, filters = {}) => {
  const { awardCategoryIds } = filters;

  const awardQuery = client("awards")
    .select("awards.*")
    .where({hackathon_id: hackathonId})
    .orderBy("awards.name", "asc");

  if (awardCategoryIds) {
    awardQuery
      .innerJoin("awards_award_categories", "awards.id", "=",
        "awards_award_categories.award_id")
      .whereIn("awards_award_categories.award_category_id", awardCategoryIds);
  }

  return awardQuery;
};

export const addAwardProjectsAndCategoriesToPagination = (paginationQuery) => {
  return paginationQuery.then((pagination) => {
    const projectIds = _.pluck(pagination.data, "project_id");
    const projectsQuery = client("projects")
      .innerJoin("users", "projects.owner_id", "=", "users.id")
      .select("projects.*", "users.name as owner_name")
      .whereIn("projects.id", projectIds);

    // all stats are grouped by project_id for augmenting project results
    const statQuery = (table) => {
      return client(table)
        .select("project_id")
        .count(`project_id as ${table}`)
        .groupBy("project_id")
        .whereIn("project_id", projectIds);
    };
    const likesQuery = statQuery("likes");
    const sharesQuery = statQuery("shares");
    const viewsQuery = statQuery("views");

    // member query which we'll use to augment project results
    const membersQuery = client("members")
      .innerJoin("users", "members.user_id", "=", "users.id")
      .whereIn("project_id", projectIds)
      .select("project_id", "users.name", "users.id");

    const awardIds = _.pluck(pagination.data, "id");
    const awardCategoriesQuery = client("awards_award_categories")
      .innerJoin(
        "award_categories",
        "awards_award_categories.award_category_id",
        "=",
        "award_categories.id"
      )
      .whereIn("awards_award_categories.award_id", awardIds)
      .select("awards_award_categories.award_id", "award_categories.*");

    return Promise.all([
      projectsQuery,
      likesQuery,
      sharesQuery,
      viewsQuery,
      membersQuery,
      awardCategoriesQuery
    ]).then(([projects, likes, shares, views, members, awardCategories]) => {
      const projectsById = _.groupBy(projects, "id");
      const likesByProjectId = _.groupBy(likes, "project_id");
      const sharesByProjectId = _.groupBy(shares, "project_id");
      const viewsByProjectId = _.groupBy(views, "project_id");
      const membersByProjectId = _(members)
        .groupBy("project_id")
        .mapValues((values) => {
          return _.map(values, (member) => _.omit(member, "project_id"));
        })
        .value();
      const awardCategoriesByAwardId = _(awardCategories)
        .groupBy("award_id")
        .mapValues((categories) => {
          return _.map(categories, (category) => _.omit(category, "award_id"));
        })
        .value();
      pagination.data = _.map(pagination.data, (award) => {
        award.project = projectsById[award.project_id][0];
        const getStat = (byProjectId, stat) => {
          return byProjectId[award.project_id] &&
            byProjectId[award.project_id][0][stat] || 0;
        };
        award.project.likes = getStat(likesByProjectId, "likes");
        award.project.shares = getStat(sharesByProjectId, "shares");
        award.project.views = getStat(viewsByProjectId, "views");
        award.project.members = membersByProjectId[award.project_id] || [];
        award.award_categories = awardCategoriesByAwardId[award.id] || [];
        return award;
      });
      return pagination;
    });
  });
};

export const ensureAwardCategory = (hackathonId, id) => {
  const query = client("award_categories")
    .select("*")
    .where({hackathon_id: hackathonId, id});
  return query.then((awardCategories) => {
    const awardCategory = awardCategories[0];
    if (!awardCategory) {
      throw Boom.notFound(`No award category ${id} exists.`);
    }
    return awardCategory;
  });
};

const lookupUserCityId = (userId) => {
  const query = client("cities")
  .select("cities.id")
  .innerJoin("users", function () {
    this.on("users.city", "=", "cities.city")
      .andOn("users.country", "=", "cities.country");
  })
  .where("users.id", "=", userId);
  return query.then((response) => {
    if (response && response.length === 1) {
      return response[0].id;
    } else {
      return null;
    }
  });
};

export const incrementCityCount = (hackathonId, userId) => {
  return lookupUserCityId(userId).then((cityId) => {
    if (cityId) {
      const rawQuery = [
        "insert into city_counts (city_id, hackathon_id, count)",
        `values ((select id from cities where id=${cityId}),`,
        `(select id from hackathons where id=${hackathonId}), 1)`,
        " on duplicate key update count=count+1"].join(" ");
      return client.raw(rawQuery);
    }
  });
};

export const decrementCityCount = (hackathonId, userId) => {
  return lookupUserCityId(userId).then((cityId) => {
    if (cityId) {
      const rawQuery = ["update city_counts set count=count-1",
        `where city_id=${cityId} and hackathon_id=${hackathonId}`
      ].join(" ");
      return client.raw(rawQuery).then(() => {
        return client("city_counts")
        .where("count", "=", 0)
        .del();
      });
    }
  });
};

export const getHackathonCities = (hackathonId) => {
  return client("city_counts")
    .select("cities.city")
    .select("cities.country")
    .select("cities.lat")
    .select("cities.long")
    .select("city_counts.count")
    .join("cities", "city_counts.city_id", "cities.id")
    .where("city_counts.hackathon_id", "=", hackathonId);
};

export const getHackathonReport = (queryObj) => {
  const query = client("users")
    .select(
    [
      "users.email as email",
      "users.json_working_on as json_working_on",
      "users.json_expertise as json_expertise",
      "users.json_interests as json_interests",
      "participants.joined_at as registration_date",
      "reports.json_reporting_data as json_reporting_data"
    ])
    .from("users")
    .join("participants", "users.id", "participants.user_id")
    .leftJoin("reports", "users.email", "reports.email")
    .where({"participants.hackathon_id": queryObj.hackathon_id});
  return query;
};
