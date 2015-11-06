/*eslint camelcase: [2, {"properties": "never"}] */
import Lab from "lab";
import assert from "assert";
import ensure from "./helpers";

const lab = exports.lab = Lab.script();

lab.test("fetch all users", (done) => {
  ensure({
    method: "GET",
    url: "/users",
    hasPagination: true
  }, done);
});

lab.test("CRUD a user", {timeout: 2000}, (done) => {
  const USER_ID = 4;

  const properties = {
      display_name:"Jane Foo",
      email:"jane.foo@microsoft.com",
      bio:"Elite coder",
  }

  ensure({
    method: "POST",
    url: `/users`,
    payload: properties,
    statusCode: 201
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: `/users/${USER_ID}`,
      hasPagination: false,
      test(result) {
        assert.equal(result.email, properties.email, "ensure properites persisteted");
      }
    });
  })
  .then(() => {
    return ensure({
      method: "DELETE",
      url: `/users/${USER_ID}`,
      statusCode: 204
    });
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: `/users`,
      hasPagination: true,
      test(result) {
        assert.ok(
          !result.data.some((user) => user.id === USER_ID),
          "make sure deleted user is not listed in results"
        );
      }
    }, done);
  });
});
