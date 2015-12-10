/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";

/*
// test search fields
const testCoverageOfSearchFields = (field, value) => {
  test(`search should cover '${field}'`, (t) => {
    ensure({
      method: "GET",
      url: `/hackathons/1/participants?search=${value}`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.equal(result.data.length, 1, "should only find one");
        t.ok(result.data[0][field].toLowerCase().indexOf(value) !== -1, "field contains value");
      }
    }, t);
  });

  test(`search should cover '${field}' in global search`, (t) => {
    ensure({
      method: "GET",
      url: `/user-search?search=${value}`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.equal(result.data.length, 1, "should only find one");
        t.ok(result.data[0][field].toLowerCase().indexOf(value) !== -1, "field contains value");
      }
    }, t);
  });
};

// note: these are all unique enough in our mock data set
// that I know we should always get one and only one matching
// result
testCoverageOfSearchFields("name", "henrik");
testCoverageOfSearchFields("email", "hjoreteg@gmail.com");
testCoverageOfSearchFields("bio", "some js dev");
testCoverageOfSearchFields("working_on", "progressive web app");
testCoverageOfSearchFields("expertise", "jsstuf");
*/

const containsId = (result, id) => {
  return result.data.some((userItem) => userItem.id === id);
};

test(`can filter via 'has_project=true'`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/participants?has_project=true`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(containsId(result, mockUsers[0].id), "first user listed as participant");
      t.ok(containsId(result, mockUsers[1].id), "second user listed as participant");
      t.ok(!containsId(result, mockUsers[2].id), "third users not listed as participant");
    }
  }, t);
});

test(`can filter via 'has_project=true' in global search`, (t) => {
  ensure({
    method: "GET",
    url: `/user-search?has_project=true`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(containsId(result, mockUsers[0].id), "first user listed as participant");
      t.ok(containsId(result, mockUsers[1].id), "second user listed as participant");
      t.ok(!containsId(result, mockUsers[2].id), "third users not listed as participant");
    }
  }, t);
});

test(`can filter via 'has_project=false'`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/participants?has_project=false`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.equal(result.data.length, 0, "all users have projects");
    }
  }, t);
});

test(`can filter via 'has_project=false' in global search`, (t) => {
  ensure({
    method: "GET",
    url: `/user-search?has_project=false&limit=100`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(!containsId(result, mockUsers[0].id), "first user not listed");
      t.ok(!containsId(result, mockUsers[1].id), "second user not listed");
      t.ok(containsId(result, mockUsers[2].id), "third user is listed");
    }
  }, t);
});

// a bit of re-usable code to make sure tests cover everything
const runFixedTypeFilterTests = (type, value, itemTest) => {
  test(`can filter via '${type}=${encodeURIComponent(value)}`, (t) => {
    ensure({
      method: "GET",
      url: `/hackathons/1/participants?${type}=${value}`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.ok(result.data.length, "should have at least one match");
        t.ok(result.data.every((item) => itemTest(item)), "all results match");
      }
    }, t);
  });

  test(`can filter via '${type}=${encodeURIComponent(value)} in global search`, (t) => {
    ensure({
      method: "GET",
      url: `/user-search?${type}=${value}`,
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
      url: `/hackathons/1/participants?${type}=SomethingSilly`,
      statusCode: 400
    }, t);
  });

  test(`should fail if invalid '${type}' in global search`, (t) => {
    ensure({
      method: "GET",
      url: `/user-search?${type}=SomethingSilly`,
      statusCode: 400
    }, t);
  });
};

runFixedTypeFilterTests("role", "Developer", (item) => item.primary_role === "Developer");
runFixedTypeFilterTests("product_focus", "Office", (item) => item.product_focus === "Office");
runFixedTypeFilterTests("country", "USA", (item) => item.country === "USA");
