/*eslint camelcase: [2, {"properties": "never"}] */
import Lab from "lab";
import assert from "assert";
import ensure from "./helpers";

const lab = exports.lab = Lab.script();

lab.test("fetch comments for a project", (done) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/1/comments",
    hasPagination: true
  }, done);
});

lab.test("CRUD a comment", {timeout: 2000}, (done) => {
  const properties = {
    body: "Some comment",
    user_id: 1
  };

  let commentId;

  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/comments",
    statusCode: 201,
    payload: properties
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: "/hackathons/1/projects/1/comments",
      test(result) {
        assert.ok(
          result.some((comment) => {
            if (comment.body === properties.body) {
              // track which one was our ID
              commentId = comment.id;
              return true;
            }
          }),
          "make sure the added comment is listed in results"
        );
      }
    });
  })
  .then(() => {
    return ensure({
      method: "DELETE",
      url: `/hackathons/1/projects/1/comments/${commentId}`,
      statusCode: 204
    });
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: `/hackathons/1/projects/1/comments`,
      test(result) {
        assert.ok(
          !result.some((comment) => comment.id === commentId),
          "make sure added comment is no longer listed"
        );
      }
    }, done);
  });
});
