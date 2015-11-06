/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import Joi from "joi";
import ensure from "./helpers";
import { user } from "../data/validation";

test("fetch members for a project", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/1/members",
    hasPagination: false,
    test(result) {
      t.ok(result.length, "make sure we get some results");
      result.forEach((item) => {
        t.ok(Joi.validate(item, user), "each result should be a user");
      });
    }
  }, t);
});

const USER_ID = 3;

test("add a user to a project", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/1/projects/1/members/${USER_ID}`,
    statusCode: 204
  }, t);
});

test("new user is listed as member", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/1/members`,
    test(result) {
      t.ok(
        result.some((member) => member.id === USER_ID),
        "make sure added user is listed in results"
      );
    }
  }, t);
});

test("remove new member", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/1/members/${USER_ID}`,
    statusCode: 204
  }, t);
});

test("new member is gone from list", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/1/members`,
    test(result) {
      t.ok(
        !result.some((member) => member.id === USER_ID),
        "make sure added user is not listed in results"
      );
    }
  }, t);
});
