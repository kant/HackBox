import test from "tape";
import {validate} from "../plugins/auth";

const token = "some token";

test("it should fail without bearer token", (t) => {
  validate(null, (err, valid, profile) => {
    t.equal(valid, false, "invalid token should fail");
    t.end();
  });
});

// test("it should pass with valid bearer token", (t) => {
//   validate(token, (err, valid, profile) => {
//     t.equal(valid, true, "valid token should pass");
//     t.end();
//   });
// });
