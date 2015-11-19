/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";

const NEW_USER_ID = mockUsers[1].id;

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
    url: `/hackathons/1/participants/${NEW_USER_ID}`,
    statusCode: 204
  }, t);
});

test("participant is in list", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/participants`,
    hasPagination: true,
    test(result) {
      t.ok(
        result.data.some((participant) => participant.id === NEW_USER_ID),
        "make sure added users is listed in results"
      );
    }
  }, t);
});

test("remove participant", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/1/participants/${NEW_USER_ID}`,
    statusCode: 204
  }, t);
});

test("participant is not in list", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/participants`,
    hasPagination: true,
    test(result) {
      t.ok(
        !result.data.some((participant) => participant.id === NEW_USER_ID),
        "make sure added user is not listed in results"
      );
    }
  }, t);
});
