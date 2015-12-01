/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";
import { participant as participantSchema } from "../data/validation";

const B_USER_ID = mockUsers[1].id;
const C_USER_ID = mockUsers[2].id;

test("fetch participants for a hackathon", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/participants",
    hasPagination: true,
    schema: participantSchema
  }, t);
});

test("add a new participant", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/1/participants/${C_USER_ID}`,
    statusCode: 200,
    schema: participantSchema,
    payload: {},
    user: "c"
  }, t);
});

test("cannot add same participant again", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/1/participants/${C_USER_ID}`,
    statusCode: 409,
    payload: {},
    user: "c"
  }, t);
});

test("participant is in list", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/participants`,
    hasPagination: true,
    schema: participantSchema,
    test(result) {
      t.ok(
        result.data.some((participant) => participant.id === C_USER_ID),
        "make sure added users is listed in results"
      );
      t.ok(
        result.data.every((participant) => participant.name),
        "make sure participant results also includes user data"
      );
    }
  }, t);
});

test("remove participant", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/participants/${C_USER_ID}`,
    statusCode: 204,
    user: "c"
  }, t);
});

test("participant is not in list", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/participants`,
    hasPagination: true,
    schema: participantSchema,
    test(result) {
      t.ok(
        !result.data.some((participant) => participant.id === C_USER_ID),
        "make sure added user is not listed in results"
      );
    }
  }, t);
});

test("add participant with metadata", (t) => {
  const meta = {
    participation_meta: {
      shirt_color_preference: "blue"
    }
  };

  ensure({
    method: "POST",
    url: `/hackathons/1/participants/${C_USER_ID}`,
    statusCode: 200,
    payload: meta,
    schema: participantSchema,
    test(result) {
      t.deepEqual(result.participation_meta, meta.participation_meta, "meta data comes back");
    },
    user: "c"
  }, t);
});

test("edit participant metadata", (t) => {
  const meta = {
    participation_meta: {
      shirt_color_preference: "purple"
    }
  };

  ensure({
    method: "PUT",
    url: `/hackathons/1/participants/${C_USER_ID}`,
    statusCode: 200,
    payload: meta,
    schema: participantSchema,
    test(result) {
      t.deepEqual(result.participation_meta, meta.participation_meta, "edited meta data");
    },
    user: "c"
  }, t);
});

test("cannot remove other participant", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/participants/${B_USER_ID}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("cannot join non-public hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/2/participants/${C_USER_ID}`,
    statusCode: 403,
    payload: {},
    user: "c"
  }, t);
});

test("hackathon admin can add participant to non-public hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/2/participants/${C_USER_ID}`,
    statusCode: 200,
    payload: {},
    schema: participantSchema,
    user: "b"
  }, t);
});

test("hackathon admin can edit participant metadata", (t) => {
  const meta = {
    participation_meta: {
      shirt_color_preference: "green"
    }
  };

  ensure({
    method: "PUT",
    url: `/hackathons/1/participants/${C_USER_ID}`,
    statusCode: 200,
    payload: meta,
    schema: participantSchema,
    test(result) {
      t.deepEqual(result.participation_meta, meta.participation_meta, "edited meta data");
    },
    user: "b"
  }, t);
});

test("hackathon admin can remove participant from non-public hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/2/participants/${C_USER_ID}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("super user can add participant to non-public hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/2/participants/${C_USER_ID}`,
    statusCode: 200,
    payload: {},
    schema: participantSchema,
    user: "a"
  }, t);
});

test("super user can edit participant metadata", (t) => {
  const meta = {
    participation_meta: {
      shirt_color_preference: "yellow"
    }
  };

  ensure({
    method: "PUT",
    url: `/hackathons/1/participants/${C_USER_ID}`,
    statusCode: 200,
    payload: meta,
    schema: participantSchema,
    test(result) {
      t.deepEqual(result.participation_meta, meta.participation_meta, "edited meta data");
    },
    user: "a"
  }, t);
});


test("super user can remove participant from non-public hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/2/participants/${C_USER_ID}`,
    statusCode: 204,
    user: "a"
  }, t);
});

