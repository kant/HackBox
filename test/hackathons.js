/*eslint camelcase: [2, {"properties": "never"}] */
import test from "tape";
import _ from "lodash";
import moment from "moment";
import ensure from "./helpers";
import { hackathon } from "../data/validation";
import { users as mockUsers } from "../data/mock-data";
import { hackathonStatus } from "../db-connection";

const aUserId = mockUsers[0].id;
const bUserId = mockUsers[1].id;
const cUserId = mockUsers[2].id;

let hackathonId;

test("fetch hackathon list ordered by created_at desc by default", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons",
    hasPagination: true,
    test(result) {
      t.ok(result.data.every((item) => item.is_published), "shouldn't include unpublished data");
      t.ok(result.data.every((item) => _.isNumber(item.participants)), "should count participants");
      t.ok(result.data.every((item) => _.isNumber(item.projects)), "should count projects");
      t.ok(result.data[0].created_at >= result.data[1].created_at,
        "should include ordered results");
      const statuses = ["active", "not_started", "completed", "ongoing"];
      t.ok(result.data.every((item) => _.includes(statuses, item.status)),
        "should have statuses");
      const hackathon1 = _.find(result.data, (h) => h.id === 1);
      t.equal(hackathon1.projects, 2, "hackathon 1 should have correct projects");
      t.equal(hackathon1.participants, 2, "hackathon 1 should have correct participants");
    },
    schema: hackathon
  }, t);
});

test("fetch hackathon list ordered by start_at asc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=start_at&sort_direction=asc",
    hasPagination: true,
    test(result) {
      t.ok(result.data[0].start_at < result.data[1].start_at, "should include ordered results");
    }
  }, t);
});

test("fetch hackathon list ordered by start_at desc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=start_at&sort_direction=desc",
    hasPagination: true,
    test(result) {
      t.ok(result.data[0].start_at > result.data[1].start_at, "should include ordered results");
    }
  }, t);
});

test("fetch hackathon list ordered by end_at asc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=end_at&sort_direction=asc",
    hasPagination: true,
    test(result) {
      const endAts = _.pluck(result.data, "end_at");
      const nullCount = _.filter(endAts, _.isNull).length;
      const notNulls = _.slice(endAts, 0, endAts.length - nullCount);
      const nulls = _.slice(endAts, endAts.length - nullCount);
      t.ok(_.every(notNulls, (e) => !_.isNull(e)), "not-nulls should be sorted first");
      t.ok(_.every(nulls, _.isNull), "nulls should be sorted last");
      const sortedNotNulls = notNulls.sort();
      t.deepEqual(notNulls, sortedNotNulls, "not-nulls should be sorted");
    }
  }, t);
});

test("fetch hackathon list ordered by end_at desc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=end_at&sort_direction=desc",
    hasPagination: true,
    test(result) {
      const endAts = _.pluck(result.data, "end_at");
      const nullCount = _.filter(endAts, _.isNull).length;
      const notNulls = _.slice(endAts, 0, endAts.length - nullCount);
      const nulls = _.slice(endAts, endAts.length - nullCount);
      t.ok(_.every(notNulls, (e) => !_.isNull(e)), "not-nulls should be sorted first");
      t.ok(_.every(nulls, _.isNull), "nulls should be sorted last");
      const sortedNotNulls = notNulls.sort().reverse();
      t.deepEqual(notNulls, sortedNotNulls, "not-nulls should be sorted");
    }
  }, t);
});

test("fetch hackathon list ordered by name asc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=name&sort_direction=asc",
    hasPagination: true,
    test(result) {
      const names = _.pluck(result.data, "name");
      const sortedNames = names.sort();
      t.deepEqual(names, sortedNames, "should include ordered results");
    }
  }, t);
});

test("fetch hackathon list ordered by name desc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=name&sort_direction=desc",
    hasPagination: true,
    test(result) {
      const names = _.pluck(result.data, "name");
      const sortedNames = names.sort().reverse();
      t.deepEqual(names, sortedNames, "should include ordered results");
    }
  }, t);
});

test("fetch hackathon list ordered by participants asc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=participants&sort_direction=asc",
    hasPagination: true,
    test(result) {
      const participants = _.pluck(result.data, "participants");
      const sortedParticipants = participants.sort();
      t.deepEqual(participants, sortedParticipants, "should include ordered results");
    }
  }, t);
});

test("fetch hackathon list ordered by participants desc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=participants&sort_direction=desc",
    hasPagination: true,
    test(result) {
      const participants = _.pluck(result.data, "participants");
      const sortedParticipants = participants.sort().reverse();
      t.deepEqual(participants, sortedParticipants, "should include ordered results");
    }
  }, t);
});

test("fetch hackathon list ordered by projects asc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=projects&sort_direction=asc",
    hasPagination: true,
    test(result) {
      const projects = _.pluck(result.data, "projects");
      const sortedProjects = projects.sort();
      t.deepEqual(projects, sortedProjects, "should include ordered results");
    }
  }, t);
});

test("fetch hackathon list ordered by projects desc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=projects&sort_direction=desc",
    hasPagination: true,
    test(result) {
      const projects = _.pluck(result.data, "projects");
      const sortedProjects = projects.sort().reverse();
      t.deepEqual(projects, sortedProjects, "should include ordered results");
    }
  }, t);
});

test("fetch hackathon list ordered by status asc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=status&sort_direction=asc",
    hasPagination: true,
    test(result) {
      const statuses = _.pluck(result.data, "status");
      const sortedStatuses = ["active", "active", "ongoing", "not_started", "completed"];
      t.deepEqual(statuses, sortedStatuses, "should include ordered results");
      const actives = _.slice(result.data, 0, 2);
      t.deepEqual(actives, _.sortBy(actives, "end_at"), "actives should be ordered");
    }
  }, t);
});

test("fetch hackathon list ordered by status desc", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?sort_col=status&sort_direction=desc",
    hasPagination: true,
    test(result) {
      const statuses = _.pluck(result.data, "status");
      const sortedStatuses = ["completed", "not_started", "ongoing", "active", "active"];
      t.deepEqual(statuses, sortedStatuses, "should include ordered results");
      const actives = _.slice(result.data, 4);
      t.deepEqual(actives, _.sortBy(actives, "end_at").reverse(), "actives should be ordered");
    }
  }, t);
});

test("fetch hackathon as admin", (t) => {
  ensure({
    method: "GET",
    url: "/hackathons?include_unpublished=true",
    hasPagination: true,
    user: "a",
    test(result) {
      t.ok(result.data.some((item) => !item.is_published), "should include unpublished data");
    }
  }, t);
});

// we'll use this to store results between tests
// to ensure PUT doesn't accidentally change anything
let createdHackathon;

test("user b can create a hackathon", (t) => {
  const properties = {
    name: "Bingcubator Hack 2025",
    slug: "bingcubator-hack-2025",
    description: "description",
    tagline: "tagline",
    header_image_url: "http://example.com/header.gif",
    logo_url: "http://example.com/hack.gif",
    start_at: new Date(Date.now() - 1000 * 60),
    end_at: new Date(Date.now() + 86400 * 5),
    city: "Redmond",
    country: "United States",
    is_published: false,
    meta: {
      some_key: "some_value"
    }
  };

  ensure({
    method: "POST",
    url: "/hackathons",
    statusCode: 201,
    payload: properties,
    test(result) {
      createdHackathon = result;
      hackathonId = result.id;
      const value = result.meta && result.meta.some_key;
      t.equal(value, "some_value", "make sure meta keys are persisted");
      t.ok(result.admins.length, "should have creator listed as admin");
      t.equal(result.is_published, false, "should be unpublished");
      t.equal(result.color_scheme, "Visual Studio purple", "default should be populated");
      t.ok(result.updated_at, "make sure this result has an updated_at");
    },
    user: "b"
  }, t);
});

test("user b can create a hackathon with very long fields", (t) => {
  const properties = {
    name: "Big Hack",
    slug: "big-hack",
    description: `${"descI♥NY".repeat(6553)}+five`, // 65535 characters
    judges: `${"judgI♥NY".repeat(6553)}+five`, // 65535 characters
    rules: `${"ruleI♥NY".repeat(6553)}+five`, // 65535 characters
    schedule: `${"scheI♥NY".repeat(6553)}+five`, // 65535 characters
    tagline: "tagline",
    header_image_url: "http://example.com/header.gif",
    logo_url: "http://example.com/hack.gif",
    start_at: new Date(),
    end_at: new Date(Date.now() + 86400 * 5),
    city: "Redmond",
    country: "United States",
    is_published: false,
    meta: {
      some_key: "some_value"
    }
  };

  ensure({
    method: "POST",
    url: "/hackathons",
    statusCode: 201,
    payload: properties,
    test(result) {
      const value = result.meta && result.meta.some_key;
      t.equal(value, "some_value", "make sure meta keys are persisted");
      t.ok(result.admins.length, "should have creator listed as admin");
      t.equal(result.is_published, false, "should be unpublished");
      t.equal(result.color_scheme, "Visual Studio purple", "default should be populated");
      t.ok(result.updated_at, "make sure this result has an updated_at");
    },
    user: "b"
  }, t);
});

test("get user b can get newly created hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    schema: hackathon,
    user: "b"
  }, t);
});

test("get user a can get newly created hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    schema: hackathon,
    user: "a"
  }, t);
});

test("get user c cannot get newly created hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 404,
    user: "c"
  }, t);
});

test("user b can update newly created hackathon", (t) => {
  // make sure our updated at timestamp
  // has waited long enough to actually be
  // able to test if it's different
  // this is important since we only store
  // time down to the second
  setTimeout(() => {
    ensure({
      method: "PUT",
      url: `/hackathons/${hackathonId}`,
      payload: {
        is_published: true
      },
      test(result) {
        t.equal(result.is_published, true, "should now be published");

        // make sure nothing else has been edited by the update
        t.ok(result.updated_at, "make sure this result has an updated at");
        t.notEqual(createdHackathon.updated_at, result.updated_at, "`updated_at` should change");

        // copy these properties over
        createdHackathon.is_published = result.is_published;
        createdHackathon.updated_at = result.updated_at;

        // now the two should be identical, nothing else
        // should have changed.
        t.deepEqual(result, createdHackathon, "should now be equivalent");

      },
      user: "b"
    }, t);
  }, 1100);
});


test("get user c cannot get published hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    user: "c"
  }, t);
});

test("user c cannot update hackathon", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/${hackathonId}`,
    payload: {
      name: "I'm not an owner"
    },
    statusCode: 403,
    user: "c"
  }, t);
});

test("super user can update hackathon", (t) => {
  const newName = "I'm a super user, hear me roar";
  ensure({
    method: "PUT",
    url: `/hackathons/${hackathonId}`,
    payload: {
      name: newName
    },
    statusCode: 200,
    user: "a",
    test(result) {
      t.equal(result.name, newName, "should have new name");
    }
  }, t);
});

test("user c cannot delete someone else's hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("user b can delete newly created hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("super user can still retrieve deleted hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    test(result) {
      t.equal(result.deleted, true, "should show as deleted");
    }
  }, t);
});

test("user b can no longer retrieve deleted hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 404,
    user: "b"
  }, t);
});

test("super user can re-activate deleted hackathon", (t) => {
  ensure({
    method: "PUT",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    payload: {
      deleted: false
    },
    test(result) {
      t.equal(result.deleted, false, "should no longer show as deleted");
    }
  }, t);
});

test("user b can now retrieve hackathon again", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    user: "b"
  }, t);
});

test("user c cannot add themselves as admin to user b's hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${cUserId}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("user b can add user c as admin to their hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${cUserId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("user b cannot add user c again as admin to their hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${cUserId}`,
    statusCode: 409,
    user: "b"
  }, t);
});

test("user c is now listed as admin when fetching hackathon", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/${hackathonId}`,
    statusCode: 200,
    user: "b",
    test(result) {
      t.ok(
        result.admins.some((adminItem) => adminItem.id === cUserId),
        "new admin is listed when fetching hackathon"
      );
    }
  }, t);
});

test("user c can now add user a as an admin to hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${aUserId}`,
    statusCode: 204,
    user: "c"
  }, t);
});

test("user b can remove user c as admin from their hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${cUserId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("user c cannot remove user b as admins any more", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${bUserId}`,
    statusCode: 403,
    user: "c"
  }, t);
});

test("user b can remove user a as admin of hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${aUserId}`,
    statusCode: 204,
    user: "b"
  }, t);
});

test("user b cannot remove self as only remaining admin of the hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${bUserId}`,
    statusCode: 403,
    user: "b"
  }, t);
});

test("super user can remove user b despite being only remaining admin from a hackathon", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}/admins/${bUserId}`,
    statusCode: 204,
    user: "a"
  }, t);
});

test("super user can add user b back despite not being admin of hackathon", (t) => {
  ensure({
    method: "POST",
    url: `/hackathons/${hackathonId}/admins/${bUserId}`,
    statusCode: 204,
    user: "a"
  }, t);
});

test("super user can delete other people's hackathons", (t) => {
  ensure({
    method: "DELETE",
    url: `/hackathons/${hackathonId}`,
    statusCode: 204,
    user: "a"
  }, t);
});

test("super user can fetch all hackathons with include_deleted", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons?include_deleted=true&include_unpublished=true`,
    statusCode: 200,
    user: "a",
    hasPagination: true,
    test(result) {
      t.ok(
        result.data.some((hackathonItem) => hackathonItem.id === hackathonId),
        "make sure deleted hackathon is listed in results"
      );
      t.ok(
        result.data.some((hackathonItem) => !hackathonItem.deleted),
        "still includes the non-deleted ones"
      );
    }
  }, t);
});

test("user b can't fetch with include_deleted", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons?include_deleted=true`,
    statusCode: 403,
    user: "b"
  }, t);
});

test("stats for 'people' and 'projects' in hackathon fetch are correct", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/1`,
    statusCode: 200,
    test(result) {
      t.equal(result.projects, 2, "hacakthon 1 has two projects in the mock data");
      t.equal(result.participants, 2, "hacakthon 1 has two participants in the mock data");
    }
  }, t);
});

test("stats for 'people' and 'projects' in hackathon fetch are correct for #2", (t) => {
  ensure({
    method: "GET",
    url: `/hackathons/2`,
    statusCode: 200,
    test(result) {
      t.equal(result.projects, 50, "hacakthon 1 has 50 projects in the mock data");
      t.equal(result.participants, 52, "hacakthon 1 has 52 participants in the mock data");
    }
  }, t);
});

test("hackathon status should calculate active", (t) => {
  const mockHackathon = {
    start_at: moment().subtract(1, "days").toDate(),
    end_at: moment().add(1, "days").toDate()
  };
  t.equal(hackathonStatus(mockHackathon), "active", "should have correct status");
  t.end();
});

test("hackathon status should calculate completed", (t) => {
  const mockHackathon = {
    start_at: moment().subtract(2, "days").toDate(),
    end_at: moment().subtract(1, "days").toDate()
  };
  t.equal(hackathonStatus(mockHackathon), "completed", "should have correct status");
  t.end();
});

test("hackathon status should calculate not_started", (t) => {
  const mockHackathon = {
    start_at: moment().add(2, "days").toDate(),
    end_at: moment().add(2, "days").toDate()
  };
  t.equal(hackathonStatus(mockHackathon), "not_started", "should have correct status");
  t.end();
});

test("hackathon status should calculate ongoing", (t) => {
  const mockHackathon = {
    start_at: moment().subtract(1, "days").toDate(),
    end_at: null
  };
  t.equal(hackathonStatus(mockHackathon), "ongoing", "should have correct status");
  t.end();
});
