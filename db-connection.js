/*eslint
  camelcase: [0, {"properties": "never"}],
  max-statements: [2, 30],
  complexity: [2, 15],
  no-invalid-this: 0
*/
import knex from "knex";
import Boom from "boom";
import assert from "assert";
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
    .where({id});

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

    let result = project;

    if (opts.includeOwner) {
      const ownerQuery = client("users")
        .select("users.name")
        .where({id: project.owner_id});

      result = ownerQuery.then((users) => {
        const owner = users[0];
        if (owner) {
          project.owner = owner;
        }
        return project;
      });
    }

    return result;
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

    return user;
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
    hackathon_id, search, include_deleted, has_video, needs_hackers, country,
    needed_role, needed_expertise, product_focus, customer_type, has_member
  } = queryObj;

  const query = client("projects")
    .join("hackathons", "projects.hackathon_id", "=", "hackathons.id")
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
  if (needs_hackers === false || needs_hackers === true) {
    query.andWhere("projects.needs_hackers", needs_hackers);
  }
  if (needed_role && needed_role.length) {
    query.whereIn("projects.needed_role", needed_role);
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
  if (product_focus && product_focus.length) {
    query.whereIn("projects.product_focus", product_focus);
  }
  if (customer_type && customer_type.length) {
    query.whereIn("projects.customer_type", customer_type);
  }
  if (country && country.length) {
    query.whereIn("hackathons.country", country);
  }

  // set order by
  query.orderBy("projects.created_at", "desc");
  query.select("projects.*");

  return query;
};

export const userSearch = (queryObj) => {
  const {
    search, hackathon_id, has_project, include_deleted,
    role, product_focus, country
  } = queryObj;

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
    const rawQuery = [
      "from (select users.*, participants.json_participation_meta,",
      "(select case when exists",
      "(select * from members where members.user_id = users.id and members.hackathon_id = ?)",
      "then true else false end)",
      "as has_project from users",
      "inner join participants on participants.user_id = users.id",
      "where participants.hackathon_id = ?) as derived"
    ].join(" ");

    query = client.select().joinRaw(rawQuery, [hackathon_id, hackathon_id]);
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
        .orWhere("json_expertise", "like", `%${search}%`);
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

  // set order by
  query.orderBy("name", "asc");

  return query;
};

export const hackathonSearch = (queryObj) => {
  const {
    include_deleted, include_unpublished, country,
    admins_contain, search, sort_col, sort_direction
  } = queryObj;

  // we don't include all fields
  // because some of them could be quite large
  const columns = [
    "id",
    "name",
    "slug",
    "logo_url",
    "start_at",
    "end_at",
    "org",
    "city",
    "country",
    "tagline",
    "color_scheme",
    "created_at",
    "updated_at",
    "deleted",
    "is_public",
    "is_published",
    "json_meta"
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
    query.andWhere({deleted: false});
  }

  if (admins_contain) {
    query.whereIn("id", function () {
      this.select("hackathon_id")
        .from("hackathon_admins")
        .where("user_id", admins_contain);
    });
  }

  if (country && country.length) {
    query.whereIn("country", country);
  }

  let orderByCol = sort_col;
  let orderByDirection = sort_direction;
  if (!orderByCol) {
    orderByCol = "created_at";
    orderByDirection = "desc";
  } else if (!sort_direction) {
    orderByDirection = "asc";
  }
  query.orderBy(orderByCol, orderByDirection);

  return query;
};
