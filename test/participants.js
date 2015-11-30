/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";

const B_USER_ID = mockUsers[1].id;
const C_USER_ID = mockUsers[2].id;

test("fetch participants for a hackathon", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/participants",
    hasPagination: true
  }, t);
});

test("add a new participant", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/1/participants/${C_USER_ID}`,
    statusCode: 204,
    user: "c"
  }, t);
});

test("cannot add same participant again", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/1/participants/${C_USER_ID}`,
    statusCode: 409,
    user: "c"
  }, t);
});

test("participant is in list", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/participants`,
    hasPagination: true,
    test(result) {
      t.ok(
        result.data.some((participant) => participant.id === C_USER_ID),
        "make sure added users is listed in results"
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
    test(result) {
      t.ok(
        !result.data.some((participant) => participant.id === C_USER_ID),
        "make sure added user is not listed in results"
      );
    }
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
    user: "c"
  }, t);
});

test("hackathon admin can add participant to non-public hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/2/participants/${C_USER_ID}`,
    statusCode: 204,
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
    statusCode: 204,
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

