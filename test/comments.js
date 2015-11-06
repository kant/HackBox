/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";

const properties = {
  body: "Some comment",
  user_id: 1
};

let commentId;

test("fetch comments for a project", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/1/comments",
    hasPagination: true
  }, t);
});

test("create a comment", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/comments",
    statusCode: 201,
    payload: properties
  }, t);
});

test("get the new comment", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/1/comments",
    test(result) {
      t.ok(
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
  }, t);
});

test("delete the new comment", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/1/comments/${commentId}`,
    statusCode: 204
  }, t);
});

test("new comment is not listed in results", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/1/comments`,
    test(result) {
      t.ok(
        !result.some((comment) => comment.id === commentId),
        "make sure added comment is no longer listed"
      );
    }
  }, t);
});
