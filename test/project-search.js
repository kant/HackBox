/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";


test("search should cover tags", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects?search=social",
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(result.data.some((item) => {
        return item.tags.toLowerCase().indexOf("social") !== -1;
      }));
    }
  }, t);
});

test("search should cover title", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects?search=Yo!",
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(result.data.some((item) => {
        return item.title === "Yo!";
      }));
    }
  }, t);
});

test("search should cover tagline", (t) => {
  const searchPhrase = "yo your friends";
  ensure({
    method: "GET",
    url: `/hackathons/1/projects?search=${encodeURIComponent(searchPhrase)}`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(result.data.some((item) => {
        return item.tagline.toLowerCase().indexOf(searchPhrase) !== -1;
      }));
    }
  }, t);
});

