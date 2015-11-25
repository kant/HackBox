/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { hackathon } from "../data/validation";

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

test("regular user can create a hackathon", (t) => {
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

test("update newly created hackathon", (t) => {
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

test("non owner cannot update hackathon", (t) => {
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

test("regular user cannot delete someone else's hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("owner can delete newly created hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("make sure it's still retrievable for super user", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    test(result) {
      t.equal(result.deleted, true, "should show as deleted");
    }
  }, t);
});

test("make sure it's no longer visible for non super user", (t) => {
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

test("should be visible to regular users again", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    user: "b"
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
    }
  }, t);
});

test("regular users can't fetch with include_deleted", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons?include_deleted=true`,
    statusCode: 403,
    user: "b"
  }, t);
});


