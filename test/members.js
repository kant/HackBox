/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import Joi from "joi";
import ensure from "./helpers";
import { user } from "../data/validation";
import { users as mockUsers } from "../data/mock-data";

const B_USER_ID = mockUsers[1].id;
const C_USER_ID = mockUsers[2].id;
const D_USER_ID = mockUsers[3].id;

test("fetch members for a project", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/2/members",
    hasPagination: false,
    test(result) {
      t.ok(result.length, "make sure we get some results");
      result.forEach((item) => {
        t.ok(Joi.validate(item, user), "each result should be a user");
      });
    }
  }, t);
});

test("user 'c' cannot add self to project", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/1/projects/2/members/${C_USER_ID}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("owner 'b' can add a user 'c' to a project", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/1/projects/2/members/${C_USER_ID}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("new user 'c' is listed as member", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/2/members`,
    test(result) {
      t.ok(
        result.some((member) => member.id === C_USER_ID),
        "make sure added user is listed in results"
      );
    }
  }, t);
});

test("new member 'c' can add member 'd'", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/1/projects/2/members/${D_USER_ID}`,
    statusCode: 204,
    user: "c"
  }, t);
});

test("new member 'c' can remove member 'd'", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/2/members/${D_USER_ID}`,
    statusCode: 204,
    user: "c"
  }, t);
});

test("new member 'c' (non-owner) can edit project", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/projects/2`,
    payload: {
      title: "yo-yo!"
    },
    test(result) {
      t.equal(result.title, "yo-yo!", "title has been updated");
    },
    user: "c"
  }, t);
});

test("new member 'c' can remove themselves", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/2/members/${C_USER_ID}`,
    statusCode: 204,
    user: "c"
  }, t);
});

test("owner 'b' cannot remove themselves because they're owner", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/2/members/${B_USER_ID}`,
    statusCode: 403,
    user: "b"
  }, t);
});

test("new members 'c' and 'd' are gone from list", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/2/members`,
    test(result) {
      t.ok(
        !result.some((member) => member.id === C_USER_ID),
        "make sure user 'c' is not listed in results"
      );
      t.ok(
        !result.some((member) => member.id === D_USER_ID),
        "make sure user 'd' is not listed in results"
      );
      t.ok(
        result.some((member) => member.id === B_USER_ID),
        "make sure owner 'b' is still listed in results"
      );
    }
  }, t);
});

test("super user 'a' can add member 'c'", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/1/projects/2/members/${C_USER_ID}`,
    statusCode: 204,
    user: "a"
  }, t);
});

test("super user 'a' can delete member 'c'", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/2/members/${C_USER_ID}`,
    statusCode: 204,
    user: "a"
  }, t);
});
