/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";

const USER_B_ID = mockUsers[1].id;

// re-usable test for ensuring search terms are working
const runSearchCoverageTest = (key, value) => {
  test(`search should cover ${key}`, (t) => {
    ensure({
      method: "GET",
      url: `/hackathons?search=${value}`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.equal(result.data.length, 1, "should only return one result");
        t.ok(result.data.every((item) => {
          return item[key].toLowerCase().indexOf(value) !== -1;
        }), `some of the results should have "${value}" in the "${key}" field`);
      }
    }, t);
  });
};

// we pick unique terms so we know there should
// only be one result for each of these
runSearchCoverageTest("name", "first");
runSearchCoverageTest("slug", "inaugural");
runSearchCoverageTest("tagline", "smiling");


// a bit of re-usable code to make sure tests cover everything
const runFixedTypeFilterTests = (type, value, itemTest) => {
  test(`can filter hackathons via '${type}=${value}`, (t) => {
    ensure({
      method: "GET",
      url: `/hackathons?${type}=${value}`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.ok(result.data.length, "should have at least one match");
        t.ok(result.data.every((item) => itemTest(item)), "all results match");
      }
    }, t);
  });

  test(`should fail if invalid '${type}'`, (t) => {
    ensure({
      method: "GET",
      url: `/hackathons?${type}=SomethingSilly`,
      statusCode: 400
    }, t);
  });
};

runFixedTypeFilterTests("country", JSON.stringify(["United States"]), (item) => {
  return item.country === "United States";
});
runFixedTypeFilterTests("country", JSON.stringify(["United States", "India"]), (item) => {
  return item.country === "United States" || item.country === "India";
});

test(`super user can request 'include_unpublished' for other users`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons?include_unpublished=true&admins_contain=${USER_B_ID}`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.equal(result.data.length, 2, "should have two matches");
      t.ok(result.data.some((item) => !item.is_published), "some should be be unpublished");
    }
  }, t);
});

test(`regular users can't request include_unpublished' for other users`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons?include_unpublished=true&admins_contain=${USER_B_ID}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test(`can request list of my hackathons using id for admins_contain`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons?include_unpublished=true&admins_contain=${USER_B_ID}`,
    hasPagination: true,
    test(result) {
      t.ok(result.data.length, 2, "should return two hackathons owned by B");
      t.ok(result.data.some((item) => !item.is_published), "includes unpublished");
    },
    user: "b"
  }, t);
});

test(`can request list of my hackathons using 'me' alias for admins_contain`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons?include_unpublished=true&admins_contain=me`,
    hasPagination: true,
    test(result) {
      t.ok(result.data.length, 2, "should return two hackathons owned by B");
      t.ok(result.data.some((item) => !item.is_published), "includes unpublished");
    },
    user: "b"
  }, t);
});
