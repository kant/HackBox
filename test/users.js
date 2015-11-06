/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";

const userProperties = {
  display_name: "Jane Foo",
  email: "jane.foo@microsoft.com",
  bio: "Elite coder"
};

const USER_ID = 4;

test("fetch all users", (t) => {
  ensure({
    method: "GET",
    url: "/users",
    hasPagination: true
  }, t);
});

test("create new user", (t) => {
  ensure({
    method: "POST",
    url: `/users`,
    payload: userProperties,
    statusCode: 201
  }, t);
});

test("get created user", (t) => {
  ensure({
    method: "GET",
    url: `/users/${USER_ID}`,
    hasPagination: false,
    test(result) {
      t.equal(result.email, userProperties.email, "ensure properites persisteted");
    }
  }, t);
});

test("delete user", (t) => {
  ensure({
    method: "DELETE",
    url: `/users/${USER_ID}`,
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
        !result.data.some((user) => user.id === USER_ID),
        "make sure deleted user is not listed in results"
      );
    }
  }, t);
});
