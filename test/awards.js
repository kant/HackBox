/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import _ from "lodash";
import { award } from "../data/validation";
import ensure from "./helpers";

let createdAwardId;
const validProjectId = 1;

test("create a new award as admin of hackathon", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/awards",
    statusCode: 201,
    payload: {
      project_id: validProjectId,
      name: "Best app",
      meta: { color: "blue" }
    },
    schema: award,
    test(result) {
      createdAwardId = result.id;
      t.equal(result.name, "Best app", "name is persisted");
      t.equal(result.project_id, validProjectId, "project_id is persisted");
      t.ok(result.meta && result.meta.color === "blue", "make sure meta keys are persisted");
      t.ok(result.award_categories && result.award_categories.length === 0,
        "award categories should be empty");
    },
    user: "b"
  }, t);
});

test("create a new award w/ categories", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/awards",
    statusCode: 201,
    payload: {
      project_id: validProjectId,
      name: "Best mobile app",
      meta: { color: "blue" },
      award_category_ids: [2]
    },
    schema: award,
    test(result) {
      t.equal(result.name, "Best mobile app", "name is persisted");
      t.equal(result.project_id, validProjectId, "project_id is persisted");
      t.ok(result.meta && result.meta.color === "blue", "make sure meta keys are persisted");
      t.ok(result.award_categories && result.award_categories[0].id === 2,
        "should have award categories");
    },
    user: "b"
  }, t);
});

test("can't create a new award w/ invalid categories", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/awards",
    statusCode: 403,
    payload: {
      project_id: validProjectId,
      name: "Best mobile app",
      meta: { color: "blue" },
      award_category_ids: [1] // root category
    },
    user: "b"
  }, t);
});

test("can't create a new award if not an admin of hackathon", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/awards",
    payload: {
      project_id: validProjectId,
      name: "Best app",
      meta: { color: "blue" }
    },
    statusCode: 403,
    user: "c"
  }, t);
});

test("new award is GET-able", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/awards/${createdAwardId}`,
    schema: award,
    statusCode: 200,
    test(result) {
      t.equal(result.project_id, validProjectId, "award should be correct project");
      t.equal(result.name, "Best app", "Name should be correct");
    }
  }, t);
});

test("fetch awards", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/awards",
    hasPagination: true,
    test(result) {
      const firstAward = result.data[0];
      t.ok(_.isObject(firstAward.project), "awards have projects");
      t.ok(firstAward.project && !_.isEmpty(firstAward.project.owner_name),
        "project should have owner_name");
      t.ok(_.isArray(firstAward.award_categories), "awards have award categories");
    }
  }, t);
});

test("fetch awards filtered by parent category", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/awards?award_category_ids=[1]",
    hasPagination: true,
    test(result) {
      t.ok(result.data.length > 0, "has results");
      const hasChildCategory = (categoryId) => {
        return (a) => {
          return _.some(a.award_categories, (category) => {
            return category.parent_id === categoryId;
          });
        };
      };
      t.ok(_.all(result.data, hasChildCategory(1)), "results have correct categories");
    }
  }, t);
});

test("fetch awards filtered by child category", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/awards?award_category_ids=[2]",
    hasPagination: true,
    test(result) {
      t.ok(result.data.length > 0, "has results");
      const hasCategory = (categoryId) => {
        return (a) => {
          return _.some(a.award_categories, (category) => {
            return category.id === categoryId;
          });
        };
      };
      t.ok(_.all(result.data, hasCategory(2)), "results have correct categories");
    }
  }, t);
});

test("can't fetch with invalid category filter", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/awards?award_category_ids=[3]",
    statusCode: 403
  }, t);
});

test("hackathon admin can edit created award", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/awards/${createdAwardId}`,
    payload: {
      name: "Best mobile app"
    },
    test(result) {
      t.equal(result.name, "Best mobile app", "name has been updated");
    },
    user: "b"
  }, t);
});

test("super user can edit created award", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/awards/${createdAwardId}`,
    payload: {
      name: "Best desktop app"
    },
    test(result) {
      t.equal(result.name, "Best desktop app", "name has been updated");
    },
    user: "a"
  }, t);
});

test("non-hackathon admin can not edit created award", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/awards/${createdAwardId}`,
    payload: {
      name: "Best mobile app"
    },
    statusCode: 403,
    user: "c"
  }, t);
});

test("hackathon admin can add a category to an award", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/awards/${createdAwardId}/award_categories/2`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("award should have category after adding", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/awards/${createdAwardId}`,
    schema: award,
    statusCode: 200,
    test(result) {
      t.ok(result.award_categories && result.award_categories[0].id === 2,
        "should have new category");
    }
  }, t);
});

test("hackathon admin can't double-add a category to an award", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/awards/${createdAwardId}/award_categories/2`,
    statusCode: 403,
    user: "b"
  }, t);
});

test("hackathon admin can't add a parent category to an award", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/awards/${createdAwardId}/award_categories/1`,
    statusCode: 403,
    user: "b"
  }, t);
});

test("hackathon admin can remove a category from an award", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/awards/${createdAwardId}/award_categories/2`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("award should not have category after removing", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/awards/${createdAwardId}`,
    schema: award,
    statusCode: 200,
    test(result) {
      t.ok(result.award_categories && result.award_categories.length === 0,
        "should not have any categories");
    }
  }, t);
});

test("non-hackathon admin cannot delete award", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/awards/${createdAwardId}`,
    user: "c",
    statusCode: 403
  }, t);
});

test("hackathon admin can delete award", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/awards/${createdAwardId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("make sure award is no longer retrievable", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/awards/${createdAwardId}`,
    statusCode: 404,
    user: "b"
  }, t);
});
