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
  test(`can filter via '${type}=${encodeURIComponent(value)}`, (t) => {
    ensure({
      method: "GET",
      url: `/hackathons/1/projects?${type}=${value}`,
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
      url: `/project-search?${type}=${value}`,
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

runFixedTypeFilterTests("needed_role", "Developer", (item) => item.needed_role === "Developer");
runFixedTypeFilterTests("product_focus", "Windows", (item) => item.product_focus === "Windows");
runFixedTypeFilterTests("customer_type", "Consumers", (item) => item.customer_type === "Consumers");

test(`can filter by hackathon country by sending 'country=USA' when searching globally`, (t) => {
  ensure({
    method: "GET",
    url: `/project-search?country=USA`,
    hasPagination: true,
    statusCode: 200,
    test(result) {
      t.ok(result.data.length, "should have at least one match");
      t.ok(result.data.every((item) => item.hackathon_id === 1), "all results match");
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
