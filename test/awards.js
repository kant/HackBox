/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import { award } from "../data/validation";
import ensure from "./helpers";

let createdAwardId;
const validProjectId = 1;

test("fetch awards", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/awards",
    hasPagination: true
  }, t);
});

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
