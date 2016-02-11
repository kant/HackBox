/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";

const USER_D_ID = mockUsers[3].id;

// test search fields
const testCoverageOfSearchFields = (field, value) => {
  test(`search should cover '${field}' searching for ${value}`, (t) => {
    ensure({
      method: "GET",
      url: `/hackathons/1/participants?search=${value}`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        let firstResultValue = result.data[0][field];
        if (!Array.isArray(firstResultValue)) {
          firstResultValue = [firstResultValue];
        }
        t.equal(result.data.length, 1, "should only find one");
        t.ok(
          firstResultValue.some((item) => {
            return item.toLowerCase().indexOf(value) !== -1;
          })
        );
      }
    }, t);
  });

  test(`search should cover '${field}' in global search`, (t) => {
    ensure({
      method: "GET",
      url: `/users?search=${value}`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        let firstResultValue = result.data[0][field];
        if (!Array.isArray(firstResultValue)) {
          firstResultValue = [firstResultValue];
        }
        t.equal(result.data.length, 1, "should only find one");
        t.ok(
          firstResultValue.some((item) => {
            return item.toLowerCase().indexOf(value) !== -1;
          })
        );
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
testCoverageOfSearchFields("interests", "cycling");

// user D is on 5 different projects in hackathon two
// ensuring there are no duplicates is part of the
// standard tests performed by `ensure` on all results.
// So this is one that's likely to cause that scenario
test(`user D is on lots of projects, make sure there's no duplicates`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/2/participants?search=fishy`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(result.data.length > 0, "has at least one result");
      t.ok(result.data.some(({id}) => id === USER_D_ID), "contains fishy");
    }
  }, t);
});
test(`user D is on lots of projects, make sure there's no duplicates in global search`, (t) => {
  ensure({
    method: "GET",
    url: `/users?search=fishy`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(result.data.length > 0, "has at least one result");
      t.ok(result.data.some(({id}) => id === USER_D_ID), "contains fishy");
    }
  }, t);
});

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

test(`cannot filter via 'has_project=true' in global search if not passing hackathon id`, (t) => {
  ensure({
    method: "GET",
    url: `/users?has_project=true`,
    statusCode: 400
  }, t);
});

test(`can filter via 'has_project=true' in global search if passing hackathon_id`, (t) => {
  ensure({
    method: "GET",
    url: `/users?has_project=true&hackathon_id=1`,
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

test(`can filter via 'has_project=false' in global search as long as passing hackathon_id`, (t) => {
  ensure({
    method: "GET",
    url: `/users?has_project=false&hackathon_id=1&limit=100`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(!containsId(result, mockUsers[0].id), "first user not listed");
      t.ok(!containsId(result, mockUsers[1].id), "second user not listed");
    }
  }, t);
});

// a bit of re-usable code to make sure tests cover everything
const runFixedTypeFilterTests = (type, value, itemTest) => {
  test(`can filter via '${type}=${value}`, (t) => {
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

  test(`can filter via '${type}=${value} in global search`, (t) => {
    ensure({
      method: "GET",
      url: `/users?${type}=${value}`,
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
      url: `/users?${type}=SomethingSilly`,
      statusCode: 400
    }, t);
  });
};

runFixedTypeFilterTests("role", JSON.stringify(["Developer"]), (item) => {
  return item.primary_role === "Developer";
});
runFixedTypeFilterTests("role", JSON.stringify(["Developer", "Marketing"]), (item) => {
  return item.primary_role === "Developer" || item.primary_role === "Marketing";
});
runFixedTypeFilterTests("product_focus", JSON.stringify(["Office"]), (item) => {
  return item.product_focus === "Office";
});
runFixedTypeFilterTests("product_focus", JSON.stringify(["Office", "Windows"]), (item) => {
  return item.product_focus === "Office" || item.product_focus === "Windows";
});
runFixedTypeFilterTests("country", JSON.stringify(["United States"]), (item) => {
  return item.country === "United States";
});
runFixedTypeFilterTests("country", JSON.stringify(["United States", "India"]), (item) => {
  return item.country === "United States" || item.country === "India";
});
