/*eslint camelcase: [2, {"properties": "never"}] */
import assert from "assert";
import Lab from "lab";
import { project } from "../data/validation";
import ensure from "./helpers";

const lab = exports.lab = Lab.script();

/*
lab.test("fetch projects", (done) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/projects",
    hasPagination: true
  }, done);
});

lab.test("fetch a specific project", (done) => {
  ensure({
    method: "GET",
    url: "/hackathons/1/project/1",
    hasPagination: false,
    schema: project
  }, done);
});

lab.test("CRUD a hackathon", {timeout: 2000}, (done) => {
  const properties = {
    owner_id: 1,
    hackathon_id: 1,
    title: "Yo yo!",
    tagline: "Yo yo with your friends.",
    status: "active",
    description: "Yup, yoyo is the new yo!",
    image_url: "https://placehold.it/150x150",
    code_repo_url: "http://example.com",
    prototype_url: "http://example.com",
    supporting_files_url: "http://example.com/files",
    inspiration: "Because... yoyos!",
    how_it_will_work: "Play with yoyos.",
    needs_hackers: true,
    tags: ["Yoyo", "Social"].join(","),
    video_id: 49,
    json_meta: JSON.stringify({
      is_awesome: true
    })
  };

  ensure({
    method: "POST",
    url: "/hackathons/1/projects",
    statusCode: 201,
    payload: properties
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: "/hackathons/1/projects/3",
      schema: project,
      test(result) {
        assert.equal(result.meta.is_awesome, true, "make sure meta keys are persisted");
      }
    });
  })
  .then(() => {
    return ensure({
      method: "PUT",
      url: "/hackathons/1/projects/3",
      payload: {
        title: "yo-yo!"
      }
    });
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: "/hackathons/1/projects/3",
      test(result) {
        assert.equal(result.title, "yo-yo!");
      }
    });
  })
  .then(() => {
    return ensure({
      method: "DELETE",
      url: "/hackathons/1/projects/3",
      statusCode: 204
    });
  })
  .then(() => {
    return ensure({
      method: "GET",
      url: "/hackathons/1/projects/3",
      statusCode: 404
    }, done);
  });
});
*/
