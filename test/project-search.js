/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import { project } from "../data/validation";
import ensure from "./helpers";


test("test search queries", (t) => {
  ensure({
    method: "POST",
    url: "/hackathons/1/projects?search=yo",
    hasPagination: false,
    statusCode: 200
  }, t);
});

