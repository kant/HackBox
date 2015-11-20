/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import { project } from "../data/validation";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";

let createdProjectId;

const getProjectProps = (overrides) => {
  const result = {
    owner_id: mockUsers[0].id,
    hackathon_id: 1,
    title: "Yo yo!",
    tagline: "Yo yo with your friends.",
    status: "active",
    description: "Yup, yoyo is the new yo!",
    image_url: "https://placehold.it/150x150",
    code_repo_url: "http://example.com",
    prototype_url: "http://example.com",
    supporting_files_url: "http://example.com/files",
    inspiration: "Because... yoyos!",
    how_it_will_work: "Play with yoyos.",
    needs_hackers: true,
    tags: ["Yoyo", "Social"].join(),
    video_id: 49,
    meta: {
      is_awesome: true
    }
  };
  for (const key in overrides) {
    result[key] = overrides[key];
  }
  return result;
};

test("fetch projects", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects",
    hasPagination: true
  }, t);
});

test("fetch a specific project", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects/1",
    hasPagination: false,
    schema: project
  }, t);
});

test("create a new project", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects",
    statusCode: 201,
    payload: getProjectProps(),
    schema: project,
    test(result) {
      createdProjectId = result.id;
      const value = result.meta && result.meta.is_awesome;
      t.equal(value, true, "make sure meta keys are persisted");
    }
  }, t);
});

test("new project is GET-able", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/${createdProjectId}`,
    schema: project,
    statusCode: 200,
    test(result) {
      t.equal(result.owner_id, mockUsers[0].id, "Owner ID should be user who created it");
    }
  }, t);
});

test("edit created project", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/projects/${createdProjectId}`,
    payload: {
      title: "yo-yo!"
    },
    test(result) {
      t.equal(result.title, "yo-yo!", "title has been updated");
    }
  }, t);
});

test("non owner (user 'b') cannot edit project", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/projects/${createdProjectId}`,
    payload: {
      title: "no-no!"
    },
    user: "b",
    statusCode: 403
  }, t);
});

test("non-owner (user 'b') cannot delete project", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/${createdProjectId}`,
    user: "b",
    statusCode: 403
  }, t);
});

test("delete project", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/${createdProjectId}`,
    statusCode: 204
  }, t);
});

test("make sure project is no longer retrievable", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/${createdProjectId}`,
    statusCode: 404
  }, t);
});

let superUserCreatedProjectId;

test("super user (user 'a') can create projects owned by other people", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects",
    statusCode: 201,
    payload: getProjectProps({owner_id: "someone else"}),
    schema: project,
    test(result) {
      superUserCreatedProjectId = result.id;
      t.equal(result.owner_id, "someone else", "create project for other user");
    }
  }, t);
});

test("super user can delete projects owned by others", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/${superUserCreatedProjectId}`,
    statusCode: 204
  }, t);
});

test("regular user (user 'b') cannot create projects owned by other people", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects",
    statusCode: 403,
    payload: getProjectProps({owner_id: "someone else"}),
    user: "b"
  }, t);
});


test("like a project", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/likes",
    hasPagination: false,
    statusCode: 204
  }, t);
});

test("cannot like same project twice", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/likes",
    hasPagination: false,
    statusCode: 412
  }, t);
});

test("track a share of a project", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/shares",
    hasPagination: false,
    statusCode: 204
  }, t);
});

test("can share project repeatedly", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/shares",
    hasPagination: false,
    statusCode: 204
  }, t);
});

test("track project view", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/views",
    hasPagination: false,
    statusCode: 204
  }, t);
});

test("track same project view again", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects/1/views",
    hasPagination: false,
    statusCode: 204
  }, t);
});

