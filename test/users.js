/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";

const userId = mockUsers[0].id;

test("fetch all users", (t) => {
  ensure({
    method: "GET",
    url: "/users",
    hasPagination: true
  }, t);
});

test("delete existing user", (t) => {
  ensure({
    method: "DELETE",
    url: `/users/${userId}`,
    statusCode: 204
  }, t);
});

test("user is not in list", (t) => {
  ensure({
    method: "GET",
    url: `/users`,
    hasPagination: true,
    test(result) {
      t.ok(
        !result.data.some((user) => user.id === userId),
        "make sure deleted user is not listed in results"
      );
    }
  }, t);
});

test("create new user", (t) => {
  ensure({
    method: "POST",
    url: `/users`,
    payload: {},
    statusCode: 201,
    test(result) {
      t.equal(result.id, userId, "new created user should take Id of user");
    }
  }, t);
});

test("get created user", (t) => {
  ensure({
    method: "GET",
    url: `/users/${userId}`,
    hasPagination: false,
    test(result) {
      t.ok(result.email, "ensure email pulled from token");
      t.ok(result.id, "ensure id pulled from token");
      t.ok(result.given_name, "ensure given_name pulled from token");
      t.ok(result.family_name, "ensure family_name pulled from token");
      t.ok(result.name, "ensure name pulled from token");
      t.ok(result.created_at, "ensure created_at created");
      t.ok(result.updated_at, "ensure updated_at created");
    }
  }, t);
});
