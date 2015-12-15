/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";
import { user } from "../data/validation";

const aUserId = mockUsers[0].id;
const bUserId = mockUsers[1].id;

test("fetch all users", (t) => {
  ensure({
    method: "GET",
    url: "/users",
    hasPagination: true
  }, t);
});

test("regular users cannot delete each other users", (t) => {
  ensure({
    method: "DELETE",
    url: `/users/${aUserId}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("users can delete themselves", (t) => {
  ensure({
    method: "DELETE",
    url: `/users/${bUserId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("regular users cannot request list that includes deleted users", (t) => {
  ensure({
    method: "GET",
    url: `/users?include_deleted=true`,
    statusCode: 403,
    user: "b"
  }, t);
});

test("deleted users are not in results for regular users", (t) => {
  ensure({
    method: "GET",
    url: `/users`,
    hasPagination: true,
    test(result) {
      t.ok(
        !result.data.some((userItem) => userItem.id === bUserId),
        "make sure deleted user is not listed in results"
      );
    },
    user: "b"
  }, t);
});

test("deleted users are not in results for super users if not requested", (t) => {
  ensure({
    method: "GET",
    url: `/users`,
    hasPagination: true,
    test(result) {
      t.ok(
        !result.data.some((userItem) => userItem.id === bUserId),
        "make sure deleted user is not listed in results"
      );
    },
    user: "b"
  }, t);
});

test("deleted users is *are* in results for super users when requested", (t) => {
  ensure({
    method: "GET",
    url: `/users?include_deleted=true`,
    hasPagination: true,
    test(result) {
      t.ok(
        result.data.some((userItem) => userItem.id === bUserId),
        "make sure deleted user is listed in results"
      );
      t.ok(
        result.data.some((userItem) => !userItem.deleted),
        "make sure regular users are also included when include_deleted is true"
      );
    },
    user: "a"
  }, t);
});

test("deleted users can re-activate themselves by signing up again", (t) => {
  ensure({
    method: "POST",
    url: `/users`,
    payload: {
      working_on: "stuff,other things",
      expertise: "javascript"
    },
    statusCode: 201,
    test(result) {
      t.equal(result.id, bUserId, "new created user should take Id of user");
    },
    user: "b"
  }, t);
});

test("super users can add others by using 'trust_payload' paramater", (t) => {
  const userProps = {
    id: "some-id",
    name: "some name",
    family_name: "name",
    given_name: "some",
    email: "some@email.com"
  };
  ensure({
    method: "POST",
    url: `/users?trust_payload=true`,
    payload: userProps,
    statusCode: 201,
    test(result) {
      t.equal(result.id, userProps.id, "user should take id of user");
      t.equal(result.name, userProps.name, "user should take name of user");
      t.equal(result.family_name, userProps.family_name, "user should take family_name of user");
      t.equal(result.given_name, userProps.given_name, "user should take given_name of user");
      t.equal(result.email, userProps.email, "user should take email of user");
    },
    user: "a"
  }, t);
});

test("regular users cannot pass 'trust_payload' paramater", (t) => {
  const userProps = {
    id: "some-id",
    name: "some name",
    family_name: "name",
    given_name: "some",
    email: "some@email.com"
  };
  ensure({
    method: "POST",
    url: `/users?trust_payload=true`,
    payload: userProps,
    statusCode: 403,
    user: "b"
  }, t);
});

test("getting a user has expected fields", (t) => {
  ensure({
    method: "GET",
    url: `/users/${aUserId}`,
    hasPagination: false,
    schema: user,
    test(result) {
      t.strictEqual(result.deleted, false, "ensure deleted is false");
    }
  }, t);
});

test("re-activated users is now in results", (t) => {
  ensure({
    method: "GET",
    url: `/users`,
    hasPagination: true,
    test(result) {
      t.ok(
        result.data.some((userItem) => userItem.id === bUserId),
        "make sure deleted user is back in results"
      );
    }
  }, t);
});

test("super users can delete other users", (t) => {
  ensure({
    method: "DELETE",
    url: `/users/${bUserId}`,
    statusCode: 204,
    user: "a"
  }, t);
});

test("deleted users cannot be fetched by regular users", (t) => {
  ensure({
    method: "GET",
    url: `/users/${bUserId}`,
    hasPagination: false,
    user: "b",
    statusCode: 404
  }, t);
});

test("deleted users can be fetched by super users", (t) => {
  ensure({
    method: "GET",
    url: `/users/${bUserId}`,
    hasPagination: false,
    statusCode: 200,
    test(result) {
      t.ok(result.deleted, "should be marked as deleted");
    },
    user: "a"
  }, t);
});

test("super users can re-active deleted users with a PUT", (t) => {
  ensure({
    method: "PUT",
    url: `/users/${bUserId}`,
    payload: {
      deleted: false
    },
    statusCode: 200,
    user: "a"
  }, t);
});
