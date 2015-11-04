/*eslint camelcase: [2, {"properties": "never"}] */
import Lab from "lab";
import Joi from "joi";
import assert from "assert";
import ensure from "./helpers";
import { user } from "../data/validation";

const lab = exports.lab = Lab.script();

lab.test("fetch members for a project", (done) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/1/members",
    hasPagination: false,
    test(result) {
      assert.ok(result.length, "make sure we get some results");
      result.forEach((item) => {
        assert.ok(Joi.validate(item, user), "each result should be a user");
      });
    }
  }, done);
});

lab.test("CRUD a member", {timeout: 2000}, (done) => {
  const USER_ID = 3;

  ensure({
    method: "POST",
    url: `/hackathons/1/projects/1/members/${USER_ID}`,
    statusCode: 204
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: `/hackathons/1/projects/1/members`,
      test(result) {
        assert.ok(
          result.some((member) => member.id === USER_ID),
          "make sure added user is listed in results"
        );
      }
    });
  })
  .then(() => {
    return ensure({
      method: "DELETE",
      url: `/hackathons/1/projects/1/members/${USER_ID}`,
      statusCode: 204
    });
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: `/hackathons/1/projects/1/members`,
      test(result) {
        assert.ok(
          !result.some((member) => member.id === USER_ID),
          "make sure added user is not listed in results"
        );
      }
    }, done);
  });
});
