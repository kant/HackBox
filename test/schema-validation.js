import Lab from "lab";
import assert from "assert";

const lab = exports.lab = Lab.script();

lab.test("basic server setup", (done) => {
  assert(1 + 1, 2, "stub");
  done();
});
