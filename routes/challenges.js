/*eslint camelcase: [2, {"properties": "never"}] */ import Boom from "boom";
import {
    paginationWithDeleted, newProject, stringId, neededExpertiseArray,
    roleArray, productArray, projectUpdate, id, customerTypeArray,
    sortDirection, arrayOfStrings, voteCategoryId
} from "../data/validation";
import db, {
    paginate, ensureHackathon, ensureProject, ensureChallenge, challengeSearch
} from "../db-connection";
import Joi from "joi";
import appInsights from "applicationinsights";

const client = appInsights.getClient();

const register = function (server, options, next) {
    server.route({
        method: "GET",
        path: "/hackathons/{hackathonId}/challenges",
        config: {
            description: "Fetch challenges of a hackathon",
            tags: ["api", "detail"],
            handler(request, reply) {
                const { hackathonId } = request.params;
                const ownerId = request.isSuperUser() ? false : request.userId();
                var hackathon = {};

                const { query } = request;
                const { limit, offset } = query;

                // hardcode hackathon id to match
                query.hackathon_id = request.params.hackathonId;

                const response = ensureHackathon(hackathonId).then((hack) => {

                    const response = challengeSearch(query);

                    reply(paginate(response, { limit, offset }));
                }).then((data) => {
                    client.trackEvent("Get Challenges", { hackId: query.hackathon_id });
                    return request.generateResponse(data).code(201);
                });
            },
            validate: {
                params: {
                    hackathonId: id
                },
                query: paginationWithDeleted.keys({
                    search: Joi.string(),
                    sort_col: Joi.any()
                        .valid("created_at", "title"),
                    sort_direction: sortDirection
                })
            }
        }
    });

    server.route({
        method: "POST",
        path: "/hackathons/{hackathonId}/challenges",
        config: {
            description: "Create a new challenge",
            notes: "Create new challenges, hackathon owner can create new challenges",
            tags: ["api"],
            handler(request, reply) {
                const { hackathonId } = request.params;
                const payload = request.payload;
                const userId = request.userId();
                let challengeId;

                // always set the hackathon_id from the URL
                payload.hackathon_id = request.params.hackathonId;
                payload.created_at = new Date();
                payload.updated_at = new Date();

                console.log(" payload :: " + payload);

                const response = ensureHackathon(hackathonId).then(() => {

                    return db.transaction((trx) => {
                        return trx("challenges")
                            .insert(payload);
                    });
                }).then((data) => {
                    client.trackEvent("New challenge", { hackId: data.hackathon_id, title: data.title });
                    return request.generateResponse(data).code(201);
                });

                //    .then(() => {
                //    return db("challenges").where ensureChallenge(hackathonId, challengeId);
                //})


                reply(response);
            },
            validate: {
                params: {
                    hackathonId: id
                }
            }
        }
    });

    server.route({
        method: "DELETE",
        path: "/hackathons/{hackathonId}/challenges/{challengeId}",
        config: {
            description: "Delete a challenge",
            tags: ["api"],
            handler(request, reply) {
                const { hackathonId, challengeId } = request.params;
                const ownerId = request.isSuperUser() ? false : request.userId();
                let checkOwner = false;

                const response = Promise.all([
                    ensureHackathon(hackathonId, { checkOwner }),
                    ensureChallenge(hackathonId, challengeId),
                    db("project_challenges").where({
                        challenge_id: challengeId,
                        hackathon_id: hackathonId
                    })
                ]).then((results) => {
                    const hackathonResult = results[0];
                    const challengeResult = results[2];
                    const isHackathonAdmin = hackathonResult.admins.some((item) => item.id === request.userId());

                    if (!request.isSuperUser()) {
                        if (!isHackathonAdmin) {
                            if (challengeResult.length <= 0) {
                                throw Boom.conflict(`User ${userId} should be an owner of the challenge ${challengeId} or hackathon ${hackathonId} to delete challenge.`);
                            }
                            else {
                                throw Boom.conflict(`As you are not owner of the challenge, then you should be an owner of hackathon ${hackathonId} to delete challenge.`);
                            }
                        }
                    }
                }).then(() => {
                    return db("challenges").where({ id: challengeId }).update({ deleted: true });
                }).then(() => {
                    return request.generateResponse().code(204);
                });

                reply(response);
            },
            validate: {
                params: {
                    hackathonId: id,
                    challengeId: id
                }
            }
        }
    });

    server.route({
        method: "PUT",
        path: "/hackathons/{hackathonId}/challenges/{challengeId}",
        config: {
            description: "Edit challenge details",
            tags: ["api"],
            handler(request, reply) {
                const { hackathonId, challengeId } = request.params;
                const challengeObj = {
                    id: challengeId,
                    hackathon_id: hackathonId
                };
                const isSuperUser = request.isSuperUser();
                const ownerId = isSuperUser ? false : request.userId();
                const { payload } = request;
                payload.updated_at = new Date();

                // only superusers can delete/undelete
                // via PUT
                if (!isSuperUser) {
                    delete payload.deleted;
                }

                const response = ensureChallenge(hackathonId, challengeId, {
                    checkMember: ownerId,
                    allowDeleted: isSuperUser
                }).then((challenge) => {
                    payload.updated_at = new Date();
                    payload.created_at = challenge.created_at;
                    return db("challenges")
                        .where(challengeObj)
                        .update(payload);
                }).then(() => {
                    return ensureChallenge(hackathonId, challengeId);
                });

                reply(response);
            },
            validate: {
                ////payload: challengeUpdate,
                //params: {
                //    hackathonId: id,
                //    challengeId: id
                //}
            }
        }
    });

    next();
};



register.attributes = {
    name: "challenges",
    version: "1.0.0"
};

export default { register };
