/*eslint camelcase: [2, {"properties": "never"}] */
import assert from "assert";
import Lab from "lab";
import { hackathon } from "../data/validation";
import ensure from "./helpers";

const lab = exports.lab = Lab.script();

lab.test("fetch hackathons", (done) => {
  ensure({
    method: "GET",
    url: "/hackathons?limit=12",
    hasPagination: true
  }, done);
});

lab.test("fetch a specific hackathon", (done) => {
  ensure({
    method: "GET",
    url: "/hackathons/1",
    hasPagination: false,
    schema: hackathon
  }, done);
});

lab.test("CRUD a hackathon", {timeout: 2000}, (done) => {
  const properties = {
    name: "Bingcubator Hack 2025",
    slug: "bingcubator-hack-2025",
    description: "Yo!",
    logo_url: "http://example.com/hack.gif",
    start_at: new Date(),
    end_at: new Date(new Date(Date.now() + 86400 * 5)),
    meta: {
      some_key: "some_value"
    }
  };

  ensure({
    method: "POST",
    url: "/hackathons",
    statusCode: 201,
    payload: properties
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: "/hackathons/3",
      schema: hackathon,
      test(result) {
        assert.equal(result.meta.some_key, "some_value", "make sure meta keys are persisted");
      }
    });
  })
  .then(() => {
    return ensure({
      method: "PUT",
      url: "/hackathons/3",
      payload: {
        name: "Bingcubator Hack 2015",
        slug: "bingcubator-hack-2015"
      }
    });
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: "/hackathons/3",
      test(result) {
        assert.equal(result.name, "Bingcubator Hack 2015", "name should have changed");
        assert.equal(result.slug, "bingcubator-hack-2015", "slug should have changed");
      }
    });
  })
  .then(() => {
    return ensure({
      method: "DELETE",
      url: "/hackathons/3",
      statusCode: 204
    });
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: "/hackathons/3",
      statusCode: 404
    }, done);
  });
});
