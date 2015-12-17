/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import ensure from "./helpers";
import { users as mockUsers } from "../data/mock-data";

const USER_B_ID = mockUsers[1].id;

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

test("should not inclue results from other hackathons", (t) => {
  const searchPhrase = "yo your friends";
  ensure({
    method: "GET",
    url: `/hackathons/2/projects?search=${encodeURIComponent(searchPhrase)}`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(!result.data.some((item) => {
        return item.tagline.toLowerCase().indexOf(searchPhrase) !== -1;
      }), "should not include results from other hackathons");
    }
  }, t);
});

// a bit of re-usable code to avoid missing tests
const runBooleanFilterTests = (type, itemTest) => {
  test(`can filter via '${type}=true'`, (t) => {
    ensure({
      method: "GET",
      url: `/hackathons/1/projects?${type}=true`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.ok(result.data.length, "should have at least one match");
        t.ok(result.data.every((item) => itemTest(item)), "all results match");
      }
    }, t);
  });

  test(`can filter via '${type}=true' in global search`, (t) => {
    ensure({
      method: "GET",
      url: `/project-search?${type}=true`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.ok(result.data.length, "should have at least one match");
        t.ok(result.data.every((item) => itemTest(item)), "all results match");
      }
    }, t);
  });

  test(`can filter via '${type}=false'`, (t) => {
    ensure({
      method: "GET",
      url: `/hackathons/1/projects?${type}=false`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.ok(result.data.length, "should have at least one match");
        t.ok(result.data.every((item) => !itemTest(item)), "all results are negative");
      }
    }, t);
  });

  test(`can filter via '${type}=false' in global search`, (t) => {
    ensure({
      method: "GET",
      url: `/project-search?${type}=false`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.ok(result.data.length, "should have at least one match");
        t.ok(result.data.every((item) => !itemTest(item)), "all results are negative");
      }
    }, t);
  });
};

runBooleanFilterTests("needs_hackers", (item) => item.needs_hackers);
runBooleanFilterTests("has_video", (item) => typeof item.video_id === "number");

// a bit of re-usable code to make sure tests cover everything
const runFixedTypeFilterTests = (type, value, itemTest) => {
  test(`can filter via '${type}=${value}`, (t) => {
    console.log(`/hackathons/1/projects?${type}=${JSON.stringify(value)}`)
    ensure({
      method: "GET",
      url: `/hackathons/1/projects?${type}=${JSON.stringify(value)}`,
      hasPagination: true,
      statusCode: 200,
      test(result) {
        t.ok(result.data.length, "should have at least one match");
        t.ok(result.data.every((item) => itemTest(item)), "all results match");
      }
    }, t);
  });

  test(`can filter via '${type}=${value} in global search`, (t) => {
    console.log('in global', `/project-search?${type}=${JSON.stringify(value)}`)
    ensure({
      method: "GET",
      url: `/project-search?${type}=${JSON.stringify(value)}`,
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
      url: `/hackathons/1/projects?${type}=SomethingSilly`,
      statusCode: 400
    }, t);
  });

  test(`should fail if invalid '${type}' in global search`, (t) => {
    ensure({
      method: "GET",
      url: `/project-search?${type}=SomethingSilly`,
      statusCode: 400
    }, t);
  });
};

runFixedTypeFilterTests("needed_role", ["Developer"], (item) => {
  return item.needed_role === "Developer";
});
runFixedTypeFilterTests("needed_role", ["Developer", "Services"], (item) => {
  return item.needed_role === "Developer" || item.needed_role === "Services";
});
runFixedTypeFilterTests("product_focus", ["Windows"], (item) => {
  return item.product_focus === "Windows";
});
runFixedTypeFilterTests("product_focus", ["Windows", "Consumer Services"], (item) => {
  return item.product_focus === "Windows" || item.product_focus === "Consumer Services";
});
runFixedTypeFilterTests("customer_type", ["Consumers"], (item) => {
  return item.customer_type === "Consumers";
});
runFixedTypeFilterTests("customer_type", ["Consumers", "Developers"], (item) => {
  return item.customer_type === "Consumers" || item.customer_type === "Developers";
});
runFixedTypeFilterTests("needed_expertise", ["bostaff"], (item) => {
  return item.needed_expertise.indexOf("bostaff") !== -1;
});
runFixedTypeFilterTests("needed_expertise", ["bostaff", "throwingstar"], (item) => {
  return item.needed_expertise.indexOf("bostaff") !== -1 ||
    item.needed_expertise.indexOf("throwingstar") !== -1;
});

test(`can filter by hackathon country by sending 'country=["USA"] when searching globally`, (t) => {
  ensure({
    method: "GET",
    url: `/project-search?country=${JSON.stringify(["USA"])}`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(result.data.length, "should have at least one match");
      t.ok(result.data.every((item) => item.hackathon_id === 1), "all results match");
    }
  }, t);
});

test(`can filter by multiple countries 'country=["USA", "India"]' when searching globally`, (t) => {
  ensure({
    method: "GET",
    url: `/project-search?country=${JSON.stringify(["USA", "India"])}`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(result.data.length, "should have at least one match");
      t.ok(result.data.every((item) => [1, 2].indexOf(item.hackathon_id) !== -1), "all results match");
    }
  }, t);
});


test(`searching by country should fail if using invalid country`, (t) => {
  ensure({
    method: "GET",
    url: `/project-search?country=BOGUS`,
    statusCode: 400
  }, t);
});

test(`can do global search for projects for a given user using 'has_member' param`, (t) => {
  ensure({
    method: "GET",
    url: `/project-search?has_member=${USER_B_ID}`,
    statusCode: 200,
    hasPagination: true,
    test(result) {
      t.equal(result.data.length, 2, "user B is on two projects");
    }
  }, t);
});

test(`can do global search using 'me' as 'has_member' param`, (t) => {
  ensure({
    method: "GET",
    url: `/project-search?has_member=me`,
    statusCode: 200,
    hasPagination: true,
    test(result) {
      t.equal(result.data.length, 2, "user B is on two projects");
    },
    user: "b"
  }, t);
});

test(`hackathon specific search for projects for a given user using 'has_member' param`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects?has_member=${USER_B_ID}`,
    statusCode: 200,
    hasPagination: true,
    test(result) {
      t.equal(result.data.length, 2, "user B is on two projects");
    }
  }, t);
});

test(`hackathon specific search using 'me' as 'has_member' param`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1/projects?has_member=me`,
    statusCode: 200,
    hasPagination: true,
    test(result) {
      t.equal(result.data.length, 2, "user B is on two projects");
    },
    user: "b"
  }, t);
});

test(`projects in hackathon should be empty when scoped with 'has_member' param`, (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/2/projects?has_member=${USER_B_ID}`,
    statusCode: 200,
    hasPagination: true,
    test(result) {
      t.equal(result.data.length, 0, "user B is not in any projects in this hackathon");
    }
  }, t);
});

