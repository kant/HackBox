/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import Joi from "joi";
import { paginationWithDeleted, id, roleArray,
  countryArray, productArray, stringId, newParticipant,
  sortDirection } from "../data/validation";
import db, { paginate, ensureHackathon, ensureUser,
  ensureParticipant, userSearch, incrementCityCount,
  decrementCityCount } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/participants",
    config: {
      description: "Fetch all participants",
      tags: ["api", "list", "paginated", "filterable"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const response = ensureHackathon(hackathonId).then(() => {
          const { query } = request;
          const { limit, offset } = query;

          // make sure we limit search to within this hackathon
          query.hackathon_id = hackathonId;

          return paginate(userSearch(query), {limit, offset});
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id
        },
        query: paginationWithDeleted.keys({
          search: Joi.string(),
          has_project: Joi.boolean(),
          product_focus: productArray,
          role: roleArray,
          country: countryArray,
          sort_col: Joi.any().valid("given_name", "family_name", "joined_at"),
          sort_direction: sortDirection
        })
      }
    }
  });

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/participants/{userId}",
    config: {
      description: "Get individual participant of a hackathon",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, userId } = request.params;
        const response = ensureParticipant(hackathonId, userId, {includeUser: true});
        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          userId: stringId
        }
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/participants/{userId}",
    config: {
      description: "Add user to hackathon",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, userId } = request.params;
        const requestorId = request.userId();
        const isAddingSelf = requestorId === userId;
        const { payload } = request;
        let checkOwner = false;

        // unless you're a super user, or adding yourself
        // make sure requestor is an owner
        if (!isAddingSelf && !request.isSuperUser()) {
          checkOwner = requestorId;
        }

        payload.user_id = userId;
        payload.hackathon_id = hackathonId;

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureUser(userId),
          db("participants").where({
            user_id: userId,
            hackathon_id: hackathonId
          })
        ]).then((results) => {
          const hackathonResult = results[0];
          const participantResult = results[2];
          const isHackathonAdmin = hackathonResult.admins.some((item) => item.id === requestorId);

          // if (participantResult.length > 0) {
          //   throw Boom.conflict(`User ${userId} is already in hackathon ${hackathonId}`);
          // }

          if (!hackathonResult.is_public && isAddingSelf && !isHackathonAdmin) {
            throw Boom.forbidden(`Hackathon is not public. You must be added by a hackathon admin`);
          }
        }).then(() => {
          return db("participants").insert(payload);
        }).then(() => {
          return incrementCityCount(hackathonId, userId);
        })
        
        //If user was invited to any project - add it to the project immediately
        .then((user) => {
          return db("members_invitations").where({user_id: userId, hackathon_id: hackathonId});
        }).then((result) => {
          if (result.length == 0) {
            return Promise.reject('goToResponse');
          } else {
            var projectsToInsert = [];
            result.forEach((invitation) => {
              projectsToInsert.push({user_id: userId, project_id: invitation.project_id, hackathon_id: hackathonId});
            });
            return db("members").insert(projectsToInsert); 
          }
            
        }).then((result) => {
            return db("members_invitations").where({user_id: userId, hackathon_id: hackathonId}).del();
        }).then(() => {
            return ensureParticipant(hackathonId, userId, {includeUser: true});
        })
        .catch((err) => {
            if (err == "goToResponse") {
              return ensureParticipant(hackathonId, userId, {includeUser: true});
            } else {
              return Boom.create(500, err);
            }
        });

        reply(response);
      },
      validate: {
        payload: newParticipant,
        params: {
          hackathonId: id,
          userId: stringId
        }
      }
    }
  });

  server.route({
    method: "PUT",
    path: "/hackathons/{hackathonId}/participants/{userId}",
    config: {
      description: "edit a participants details in hackathon",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, userId } = request.params;
        const requestorId = request.userId();
        const isEditingSelf = requestorId === userId;
        const { payload } = request;
        let checkOwner = false;

        // unless you're a super user, or adding yourself
        // make sure requestor is an owner
        if (!isEditingSelf && !request.isSuperUser()) {
          checkOwner = requestorId;
        }

        const participant = {
          user_id: userId,
          hackathon_id: hackathonId
        };

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureParticipant(hackathonId, userId)
        ]).then(() => {
          payload.user_id = userId;
          payload.hackathon_id = hackathonId;
          return db("participants").where(participant).update(payload);
        }).then(() => {
          return ensureParticipant(hackathonId, userId, {includeUser: true});
        });

        reply(response);
      },
      validate: {
        payload: newParticipant,
        params: {
          hackathonId: id,
          userId: stringId
        }
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/participants/{userId}",
    config: {
      description: "Remove a user from a hackathon",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, userId } = request.params;
        const requestorId = request.userId();
        const isRemovingSelf = requestorId === userId;
        // const isSuperUser = request.isSuperUser();
        let checkOwner = false;

        // unless you're a super user, or adding yourself
        // make sure requestor is an owner
        if (!isRemovingSelf) {
          checkOwner = requestorId;
        }

        const participant = {
          user_id: userId,
          hackathon_id: hackathonId
        };

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureParticipant(hackathonId, userId)
        ]).then(() => {
          return db("participants").where(participant).del();
        }).then(() => {
          return decrementCityCount(hackathonId, userId);
        }).then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          userId: stringId
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "participants",
  version: "1.0.0"
};

export default { register };
