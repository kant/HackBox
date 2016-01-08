/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import { project } from "../data/validation";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";

let createdProjectId;
const {id: bUserId, name: bUserName} = mockUsers[1];

const getProjectProps = (overrides) => {
  const result = {
    owner_id: bUserId,
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
    tags: ["Yoyo", "Social"],
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
      t.ok(Array.isArray(result.needed_expertise), "needed_expertise is an array");
      t.ok(Array.isArray(result.tags), "tags is an array");
    },
    user: "b"
  }, t);
});

test("new project is GET-able", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/${createdProjectId}`,
    schema: project,
    statusCode: 200,
    test(result) {
      t.equal(result.members.length, 1, "project should have one member");
      t.equal(result.members[0].id, bUserId, "owner should be member");
      t.equal(result.owner_id, bUserId, "Owner ID should be user who created it");
      t.equal(result.owner.name, bUserName, "Owner name should be present");
    }
  }, t);
});

test("owner can edit created project", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/projects/${createdProjectId}`,
    payload: {
      title: "yo-yo!"
    },
    test(result) {
      t.equal(result.title, "yo-yo!", "title has been updated");
    },
    user: "b"
  }, t);
});

test("super users can edit created project", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/projects/${createdProjectId}`,
    payload: {
      title: "yo-yo!!!"
    },
    test(result) {
      t.equal(result.title, "yo-yo!!!", "title has been updated");
    },
    user: "a"
  }, t);
});

test("non member (user 'c') cannot edit project", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/projects/${createdProjectId}`,
    payload: {
      title: "no-no!"
    },
    user: "c",
    statusCode: 403
  }, t);
});

test("non-member (user 'c') cannot delete project", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/${createdProjectId}`,
    user: "c",
    statusCode: 403
  }, t);
});

test("owner can delete project", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/${createdProjectId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("make sure project is no longer retrievable", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/${createdProjectId}`,
    statusCode: 404,
    user: "b"
  }, t);
});

test("deleted project not listed when fetching all", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects`,
    statusCode: 200,
    user: "a",
    hasPagination: true,
    test(result) {
      t.ok(
        !result.data.some((projectItem) => projectItem.id === createdProjectId),
        "deleted project is not listed"
      );
    }
  }, t);
});

test("deleted project can be listed by super user with `include_deleted`", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects?include_deleted=true`,
    statusCode: 200,
    hasPagination: true,
    user: "a",
    test(result) {
      t.ok(
        result.data.some((projectItem) => projectItem.id === createdProjectId),
        "deleted project is listed"
      );
      t.ok(
        result.data.some((projectItem) => projectItem.deleted),
        "still includes non-deleted projects"
      );
      t.ok(
        result.data.some((projectItem) => !projectItem.deleted),
        "now includes deleted projects"
      );
    }
  }, t);
});

test("regular user cannot pass `include_deleted`", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects?include_deleted=true`,
    statusCode: 403,
    user: "b"
  }, t);
});

test("super user can still undelete project via a PUT", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/1/projects/${createdProjectId}`,
    statusCode: 200,
    payload: {
      deleted: false
    },
    test(result) {
      t.equal(result.deleted, false, "project was undeleted");
    },
    user: "a"
  }, t);
});

test("super user can delete projects they don't own", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/projects/${createdProjectId}`,
    statusCode: 204,
    user: "a"
  }, t);
});

test("super user can still retreive deleted project", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects/${createdProjectId}`,
    statusCode: 200,
    test(result) {
      t.ok(result.deleted, "retrieved deleted project");
    }
  }, t);
});

let superUserCreatedProjectId;

test("super user (user 'a') can create projects owned by other people", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects",
    statusCode: 201,
    payload: getProjectProps({owner_id: mockUsers[2].id}),
    schema: project,
    test(result) {
      superUserCreatedProjectId = result.id;
      t.equal(result.owner_id, mockUsers[2].id, "create project for other user");
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
    payload: getProjectProps({owner_id: mockUsers[2].id}),
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
