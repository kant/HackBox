import test from "tape";
import fs from "fs";
import {validate} from "../plugins/auth";

let token;

try {
  token = fs.readFileSync(`${__dirname}/../TOKEN`, "utf8");
} catch (e) {
  throw new Error("Create file 'TOKEN' at project root with bearer token. See README.md for info.");
}

test("it should pass with valid bearer token", (t) => {
  validate(token, (err, valid, profile) => {
    t.equal(valid, true, "valid token should pass");
    t.ok(profile.email, "profile should have an email");
    t.ok(profile.oid, "profile should have an 'oid'");
    t.end();
  });
});

test("it should fail without bearer token", (t) => {
  validate(null, (err, valid) => {
    t.equal(valid, false, "invalid token should fail");
    t.end();
  });
});
