import Lab from "lab";
import assert from "assert";
import server from "../server";

const lab = exports.lab = Lab.script();

lab.test("basic server setup", (done) => {
  server.inject({
    method: "GET",
    url: "/hackathons?limit=12"
  }, (response) => {
    assert.equal(response.statusCode, 200);
    server.stop(done);
  });
});
