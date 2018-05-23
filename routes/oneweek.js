import { getHackathonOneweek } from "../db-connection";
import * as _ from "lodash";
import { onSuccess } from "./onSuccess";
import { onError } from "./onError";

const register = function (server, options, next) {
    server.route({
        method: "GET",
        path: "/oneweekstatus",
        config: {
            description: "Get Oneweek hackathon ids that are - current, next, and previous",
            notes: ["Will get the current hackathon oneweek settings."].join(""),
            tags: ["api", "list"],
            handler(request, resp) {
                if (request.auth.credentials && request.auth.credentials.organization_id) {
                    request.query.organization_id = request.auth.credentials.organization_id;
                }
                getHackathonOneweek()
                    .then(_.partial(onSuccess, resp))
                    .catch(_.partial(onError, resp,
                        "Failed getting oneweek current-next-previous"));
            }
        }
    });
    next();
};

register.attributes = {
  name: "oneweek",
  version: "1.0.0"
};

export default { register };
