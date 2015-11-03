/*eslint camelcase: [2, {"properties": "never"}] */
import Lab from "lab";
import assert from "assert";
import ensure from "./helpers";

const lab = exports.lab = Lab.script();

lab.test("fetch members for a project", (done) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/1/members",
    hasPagination: false
  }, done);
});

lab.test("CRUD a member", {timeout: 2000}, (done) => {
  const USER_ID = 2;

  ensure({
    method: "POST",
    url: `/hackathons/1/projects/1/members/${USER_ID}`,
    statusCode: 201
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: `/hackathons/1/projects/1/members`,
      test(result) {
        assert.ok(
          result.some((member) => member.id === USER_ID),
          "make sure added users is listed in results"
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
