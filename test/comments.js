/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { comment } from "../data/validation";

let cUserComment;
let bUserComment;
let anonComment;

test("fetch comments for a project", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/1/comments",
    hasPagination: true,
    schema: comment
  }, t);
});

test("create a comment as user b", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/comments",
    statusCode: 201,
    payload: {
      body: "comment by user B"
    },
    user: "b",
    schema: comment,
    test(result) {
      bUserComment = result.id;
    }
  }, t);
});

test("create a comment as user c", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/comments",
    statusCode: 201,
    payload: {
      body: "comment by user C"
    },
    user: "c",
    schema: comment,
    test(result) {
      cUserComment = result.id;
    }
  }, t);
});

test("as super user, can create an empty comment with user omitted", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/comments?omit_user=true",
    statusCode: 201,
    payload: {
      body: " "
    },
    user: "a",
    test(result) {
      anonComment = result.id;
    }
  }, t);
});

test("get the new comment", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/1/comments",
    hasPagination: true,
    test(result) {
      t.ok(
        result.data.some((item) => item.id === bUserComment),
        "make sure the added comment is listed in results"
      );
      t.ok(
        result.data.some((item) => item.id === cUserComment),
        "make sure the added comment2 is listed in results"
      );
      t.ok(
        result.data.some((item) => item.id === anonComment),
        "make sure the added anon comment is listed in results"
      );
    }
  }, t);
});

test("user C cannot delete comment from user B", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/1/comments/${bUserComment}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("user C can delete their own comment", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/1/comments/${cUserComment}`,
    statusCode: 204
  }, t);
});

test("super user can delete comment from user B", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/1/comments/${bUserComment}`,
    statusCode: 204
  }, t);
});

test("new comment is not listed in results", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/1/comments`,
    hasPagination: true,
    test(result) {
      t.ok(
        !result.data.some((item) => item.id === bUserComment),
        "make sure added comment is no longer listed"
      );
      t.ok(
        !result.data.some((item) => item.id === cUserComment),
        "make sure added comment2 is no longer listed"
      );
    }
  }, t);
});
