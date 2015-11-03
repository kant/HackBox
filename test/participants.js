/*eslint camelcase: [2, {"properties": "never"}] */
import Lab from "lab";
import assert from "assert";
import ensure from "./helpers";

const lab = exports.lab = Lab.script();

lab.test("fetch participants for a hackathon", (done) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/participants",
    hasPagination: true
  }, done);
});

lab.test("CRUD a participant", {timeout: 2000}, (done) => {
  const USER_ID = 2;
  ensure({
    method: "POST",
    url: `/hackathons/1/participants/${USER_ID}`,
    statusCode: 201
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: `/hackathons/1/participants`,
      hasPagination: true,
      test(result) {
        assert.ok(
          result.data.some((participant) => participant.id === USER_ID),
          "make sure added users is listed in results"
        );
      }
    });
  })
  .then(() => {
    return ensure({
      method: "DELETE",
      url: `/hackathons/1/participants/${USER_ID}`,
      statusCode: 204
    });
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: `/hackathons/1/participants`,
      hasPagination: true,
      test(result) {
        assert.ok(
          !result.data.some((participant) => participant.id === USER_ID),
          "make sure added user is not listed in results"
        );
      }
    }, done);
  });
});
