import Lab from "lab";
import assert from "assert";
import server from "../server";

const lab = exports.lab = Lab.script();

lab.test("basic server setup", function(done) {
  server.inject({
    method: "GET",
    url: "/hackathons?limit=12",
  }, function(response) {
    server.stop(done);
  });
  assert(1 + 1, 2, "stub");
});
