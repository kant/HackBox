// require("babel-core").transform("code", options);

import test from "tape";
import Joi from "joi";

import { projectUpdate } from "../data/validation";

test("validation of venue with empty string", (assert) => {
  const result = Joi.validate({ venue: ""}, projectUpdate);
  assert.ok(result.error === null);
  assert.end();
});

test("validation of venue with a non-empty string", (assert) => {
  const result = Joi.validate({ venue: "Microsoft Garage"}, projectUpdate);
  assert.ok(result.error === null);
  assert.end();
});

test("validation of venue with a null string", (assert) => {
    const result = Joi.validate({ venue: null }, projectUpdate);
    assert.ok(result.error === null);
    assert.end();
});

test("validation of video_id when value is 0", (assert) => {
    const result = Joi.validate({ video_id: 0 }, projectUpdate);
    assert.ok(result.error === null);
    assert.end();
});

test("validation of video_id when value is 1", (assert) => {
    const result = Joi.validate({ video_id: 999 }, projectUpdate);
    assert.ok(result.error === null);
    assert.end();
});

test("validation of video_id when value is negative", (assert) => {
    const result = Joi.validate({ video_id: -1 }, projectUpdate);
    assert.ok(result.error === null);
    assert.end();
});

test("validation of video_id when value is null", (assert) => {
    const result = Joi.validate({ video_id: null }, projectUpdate);
    assert.ok(result.error === null);
    assert.end();
});
