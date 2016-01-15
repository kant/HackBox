/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import _ from "lodash";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";
import { user } from "../data/validation";

const aUserId = mockUsers[0].id;
const bUserId = mockUsers[1].id;
const henrikJoreteg = mockUsers[0];
const drSeuss = mockUsers[1];

test("fetch all users", (t) => {
  ensure({
    method: "GET",
    url: "/users",
    hasPagination: true
  }, t);
});

test("fetch all users sorted by given_name asc", (t) => {
  ensure({
    method: "GET",
    url: "/users?limit=50&sort_col=given_name&sort_direction=asc",
    hasPagination: true,
    test(result) {
      const givenNames = _.pluck(result.data, "given_name");
      const drSeussIndex = _.indexOf(givenNames, drSeuss.given_name);
      const henrikJoretegIndex = _.indexOf(givenNames, henrikJoreteg.given_name);
      t.ok(drSeussIndex < henrikJoretegIndex, "should be sorted by given_name");
    }
  }, t);
});

test("fetch all users sorted by given_name desc", (t) => {
  ensure({
    method: "GET",
    url: "/users?limit=50&sort_col=given_name&sort_direction=desc",
    hasPagination: true,
    test(result) {
      const givenNames = _.pluck(result.data, "given_name");
      const drSeussIndex = _.indexOf(givenNames, drSeuss.given_name);
      const henrikJoretegIndex = _.indexOf(givenNames, henrikJoreteg.given_name);
      t.ok(henrikJoretegIndex < drSeussIndex, "should be sorted by given_name");
    }
  }, t);
});

test("fetch all users sorted by family_name asc", (t) => {
  ensure({
    method: "GET",
    url: "/users?limit=50&sort_col=family_name&sort_direction=asc",
    hasPagination: true,
    test(result) {
      const familyNames = _.pluck(result.data, "family_name");
      const drSeussIndex = _.indexOf(familyNames, drSeuss.family_name);
      const henrikJoretegIndex = _.indexOf(familyNames, henrikJoreteg.family_name);
      t.ok(henrikJoretegIndex < drSeussIndex, "should be sorted by family_name");
    }
  }, t);
});

test("fetch all users sorted by family_name desc", (t) => {
  ensure({
    method: "GET",
    url: "/users?limit=50&sort_col=family_name&sort_direction=desc",
    hasPagination: true,
    test(result) {
      const familyNames = _.pluck(result.data, "family_name");
      const drSeussIndex = _.indexOf(familyNames, drSeuss.family_name);
      const henrikJoretegIndex = _.indexOf(familyNames, henrikJoreteg.family_name);
      t.ok(drSeussIndex < henrikJoretegIndex, "should be sorted by family_name");
    }
  }, t);
});

test("fetch all users sorted by family_name", (t) => {
  ensure({
    method: "GET",
    url: "/users?sort_col=family_name",
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
      working_on: ["stuff", "other things"],
      expertise: ["javascript"]
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
      t.ok(_.isNumber(result.likes), "user should have likes");
      t.ok(_.isNumber(result.shares), "user should have shares");
      t.ok(_.isNumber(result.views), "user should have views");
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
