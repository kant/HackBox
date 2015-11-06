/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { hackathon } from "../data/validation";

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

test("create a hackathon", (t) => {
  const properties = {
    name: "Bingcubator Hack 2025",
    slug: "bingcubator-hack-2025",
    description: "Yo!",
    logo_url: "http://example.com/hack.gif",
    start_at: new Date(),
    end_at: new Date(Date.now() + 86400 * 5),
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
      const value = result.meta && result.meta.some_key;
      t.equal(value, "some_value", "make sure meta keys are persisted");
    }
  }, t);
});

test("get newly created hackathon", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/3",
    schema: hackathon
  }, t);
});

test("update newly created hackathon", (t) => {
  ensure({
    method: "PUT",
    url: "/hackathons/3",
    payload: {
      name: "Bingcubator Hack 2015",
      slug: "bingcubator-hack-2015"
    },
    test(result) {
      t.equal(result.name, "Bingcubator Hack 2015", "name should have changed");
      t.equal(result.slug, "bingcubator-hack-2015", "slug should have changed");
    }
  }, t);
});

test("delete newly created hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: "/hackathons/3",
    statusCode: 204
  }, t);
});

test("make sure it was deleted", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/3",
    statusCode: 404
  }, t);
});
