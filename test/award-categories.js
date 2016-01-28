/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import _ from "lodash";
import { awardCategory, newAwardCategory } from "../data/validation";
import ensure from "./helpers";

let createdAwardCategoryId;
let createdChildAwardCategoryId;

test("create a new award category as admin of hackathon", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/award_categories",
    statusCode: 201,
    payload: {
      name: "Grand Prize Winners"
    },
    schema: newAwardCategory,
    test(result) {
      createdAwardCategoryId = result.id;
      t.equal(result.name, "Grand Prize Winners", "name is persisted");
    },
    user: "b"
  }, t);
});

test("can't create a new award category if not an admin of hackathon", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/award_categories",
    payload: {
      name: "Bronze Winners"
    },
    statusCode: 403,
    user: "c"
  }, t);
});

test("create a child award category as admin of hackathon", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/award_categories",
    statusCode: 201,
    payload: {
      name: "Blue Winners",
      parent_id: createdAwardCategoryId
    },
    schema: newAwardCategory,
    test(result) {
      createdChildAwardCategoryId = result.id;
      t.equal(result.name, "Blue Winners", "name is persisted");
      t.equal(result.parent_id, createdAwardCategoryId, "parent_id is persisted");
    },
    user: "b"
  }, t);
});

test("can't create a child of an already child award category as admin of hackathon", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/award_categories",
    statusCode: 403,
    payload: {
      name: "Teal Winners",
      parent_id: createdChildAwardCategoryId
    },
    schema: newAwardCategory,
    user: "b"
  }, t);
});

test("new award category is GET-able", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/award_categories/${createdAwardCategoryId}`,
    schema: awardCategory,
    statusCode: 200,
    test(result) {
      t.equal(result.name, "Grand Prize Winners", "name should be correct");
    }
  }, t);
});

test("new child award category is GET-able", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/award_categories/${createdChildAwardCategoryId}`,
    schema: awardCategory,
    statusCode: 200,
    test(result) {
      t.equal(result.parent_id, createdAwardCategoryId, "parent is correct");
      t.equal(result.name, "Blue Winners", "name should be correct");
    }
  }, t);
});

test("fetch award_categories", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/award_categories",
    statusCode: 200,
    test(result) {
      const newTree = _.find(result, (tree) => tree.id === createdAwardCategoryId);
      t.equal(newTree.name, "Grand Prize Winners", "root should be correct");
      t.equal(newTree.id, createdAwardCategoryId, "root id be correct");
      t.equal(newTree.children.length, 1, "tree should have 1 child");
      t.equal(newTree.children[0].id, createdChildAwardCategoryId, "child id should be correct");
      t.equal(newTree.children[0].name, "Blue Winners", "child should be correct");
    }
  }, t);
});

test("hackathon admin can edit created award category", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/award_categories/${createdAwardCategoryId}`,
    payload: {
      name: "App Winners"
    },
    test(result) {
      t.equal(result.name, "App Winners", "name has been updated");
    },
    user: "b"
  }, t);
});

test("super user can edit created award category", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/award_categories/${createdAwardCategoryId}`,
    payload: {
      name: "Desktop Winners"
    },
    test(result) {
      t.equal(result.name, "Desktop Winners", "name has been updated");
    },
    user: "a"
  }, t);
});

test("non-hackathon admin can not edit created award category", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/award_categories/${createdAwardCategoryId}`,
    payload: {
      name: "Paper Winners"
    },
    statusCode: 403,
    user: "c"
  }, t);
});

test("non-hackathon admin cannot delete award category", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/award_categories/${createdAwardCategoryId}`,
    user: "c",
    statusCode: 403
  }, t);
});

test("hackathon admin can delete award category", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/award_categories/${createdAwardCategoryId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("make sure award category is no longer retrievable", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/award_categories/${createdAwardCategoryId}`,
    statusCode: 404,
    user: "b"
  }, t);
});

test("make sure children of deleted award category are no longer retrievable", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/award_categories/${createdChildAwardCategoryId}`,
    statusCode: 404,
    user: "b"
  }, t);
});
