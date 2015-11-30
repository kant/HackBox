/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { hackathon } from "../data/validation";
import { users as mockUsers } from "../data/mock-data";

const aUserId = mockUsers[0].id;
const bUserId = mockUsers[1].id;
const cUserId = mockUsers[2].id;

let hackathonId;

test("fetch hackathon list", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?limit=12",
    hasPagination: true
  }, t);
});

test("fetch specific hackathon", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1",
    hasPagination: false,
    schema: hackathon
  }, t);
});

test("user b can create a hackathon", (t) => {
  const properties = {
    name: "Bingcubator Hack 2025",
    slug: "bingcubator-hack-2025",
    description: "Yo!",
    logo_url: "http://example.com/hack.gif",
    start_at: new Date(),
    end_at: new Date(Date.now() + 86400 * 5),
    city: "Redmond",
    country: "US",
    meta: {
      some_key: "some_value"
    }
  };

  ensure({
    method: "POST",
    url: "/hackathons",
    statusCode: 201,
    payload: properties,
    test(result) {
      hackathonId = result.id;
      const value = result.meta && result.meta.some_key;
      t.equal(value, "some_value", "make sure meta keys are persisted");
      t.ok(result.admins.length, "should have creator listed as admin");
    },
    user: "b"
  }, t);
});

test("get newly created hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    schema: hackathon,
    user: "c"
  }, t);
});

test("user b can update newly created hackathon", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/${hackathonId}`,
    payload: {
      name: "Bingcubator Hack 2015",
      slug: "bingcubator-hack-2015"
    },
    test(result) {
      t.equal(result.name, "Bingcubator Hack 2015", "name should have changed");
      t.equal(result.slug, "bingcubator-hack-2015", "slug should have changed");
    },
    user: "b"
  }, t);
});

test("user c cannot update hackathon", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/${hackathonId}`,
    payload: {
      name: "I'm not an owner"
    },
    statusCode: 403,
    user: "c"
  }, t);
});

test("super user can update hackathon", (t) => {
  const newName = "I'm a super user, hear me roar";
  ensure({
    method: "PUT",
    url: `/hackathons/${hackathonId}`,
    payload: {
      name: newName
    },
    statusCode: 200,
    user: "a",
    test(result) {
      t.equal(result.name, newName, "should have new name");
    }
  }, t);
});

test("user c cannot delete someone else's hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("user b can delete newly created hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("super user can still retrieve deleted hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    test(result) {
      t.equal(result.deleted, true, "should show as deleted");
    }
  }, t);
});

test("user b can no longer retrieve deleted hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 404,
    user: "b"
  }, t);
});

test("super user can re-activate deleted hackathon", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    payload: {
      deleted: false
    },
    test(result) {
      t.equal(result.deleted, false, "should no longer show as deleted");
    }
  }, t);
});

test("user b can now retrieve hackathon again", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    user: "b"
  }, t);
});

test("user c cannot add themselves as admin to user b's hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${cUserId}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("user b can add user c as admin to their hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${cUserId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("user b cannot add user c again as admin to their hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${cUserId}`,
    statusCode: 409,
    user: "b"
  }, t);
});

test("user c is now listed as admin when fetching hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    user: "b",
    test(result) {
      t.ok(
        result.admins.some((adminItem) => adminItem.id === cUserId),
        "new admin is listed when fetching hackathon"
      );
    }
  }, t);
});

test("user c can now add user a as an admin to hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${aUserId}`,
    statusCode: 204,
    user: "c"
  }, t);
});

test("user b can remove user c as admin from their hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${cUserId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("user c cannot remove user b as admins any more", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${bUserId}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("user b can remove user a as admin of hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${aUserId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("user b cannot remove self as only remaining admin of the hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${bUserId}`,
    statusCode: 403,
    user: "b"
  }, t);
});

test("super user can remove user b despite being only remaining admin from a hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${bUserId}`,
    statusCode: 204,
    user: "a"
  }, t);
});

test("super user can add user b back despite not being admin of hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${bUserId}`,
    statusCode: 204,
    user: "a"
  }, t);
});

test("super user can delete other people's hackathons", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}`,
    statusCode: 204,
    user: "a"
  }, t);
});

test("super user can fetch all hackathons with include_deleted", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons?include_deleted=true`,
    statusCode: 200,
    user: "a",
    hasPagination: true,
    test(result) {
      t.ok(
        result.data.some((hackathonItem) => hackathonItem.id === hackathonId),
        "make sure deleted hackathon is listed in results"
      );
      t.ok(
        result.data.some((hackathonItem) => !hackathonItem.deleted),
        "still includes the non-deleted ones"
      );
    }
  }, t);
});

test("user b can't fetch with include_deleted", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons?include_deleted=true`,
    statusCode: 403,
    user: "b"
  }, t);
});


