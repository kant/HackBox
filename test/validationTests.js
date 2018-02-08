import test from "tape";
import Joi from "joi";

import { projectUpdate } from "../data/validation";

test("validation of venue with empty string", (assert) => {
  const result = Joi.validate({ venue: ""}, projectUpdate);
  console.log(JSON.stringify(result));
  assert.ok(result.error === null);
  assert.end();
});

test("validation of venue with a non-empty string", (assert) => {
  const result = Joi.validate({ venue: "Microsoft Garage"}, projectUpdate);
  console.log(JSON.stringify(result));
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
    console.log(JSON.stringify(result));
    assert.ok(result.error === null);
    assert.end();
});

test("validation of video_id when value is 1", (assert) => {
    const result = Joi.validate({ video_id: 999 }, projectUpdate);
    console.log(JSON.stringify(result));
    assert.ok(result.error === null);
    assert.end();
});

test("validation of video_id when value is negative", (assert) => {
    const result = Joi.validate({ video_id: -1 }, projectUpdate);
    console.log(JSON.stringify(result));
    assert.ok(result.error === null);
    assert.end();
});

test("validation of video_id when value is null", (assert) => {
    const result = Joi.validate({ video_id: null }, projectUpdate);
    console.log(JSON.stringify(result));
    assert.ok(result.error === null);
    assert.end();
});
