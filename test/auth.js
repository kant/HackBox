import test from "tape";
import {validate} from "../plugins/auth";

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJkYWI1YzUxNC04YmUyLTQ5OTQtODQ4OC1lNGQ5OGEyOTc1YzEiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82ZmIwMmEwNy01Mzg5LTQwZDQtOWYwMy1jODdmOTRjMDdlYzAvIiwiaWF0IjoxNDQ3NjIxNTA2LCJuYmYiOjE0NDc2MjE1MDYsImV4cCI6MTQ0NzYyNTQwNiwiYW1yIjpbInB3ZCJdLCJlbWFpbCI6Impyd2lsc29uQGdtYWlsLmNvbSIsImZhbWlseV9uYW1lIjoiVyIsImdpdmVuX25hbWUiOiJKIiwiaWRwIjoibGl2ZS5jb20iLCJuYW1lIjoiSiBXIiwibm9uY2UiOiIzYzgyY2MwMC0zNWE1LTRhMzAtYTYxNy00MzJhMjhiNWYxMDUiLCJvaWQiOiIxYjAzYWNkNi1mMDk5LTQ3M2MtODcxMy1jYzU1OTZmMWNkMzMiLCJzdWIiOiJVMnhCeEo2YTJHZTBzdThiZlFDQmpYMTlWQy1KeVM4V2kwcFlPeVVfNkdRIiwidGlkIjoiNmZiMDJhMDctNTM4OS00MGQ0LTlmMDMtYzg3Zjk0YzA3ZWMwIiwidW5pcXVlX25hbWUiOiJsaXZlLmNvbSNqcndpbHNvbkBnbWFpbC5jb20iLCJ2ZXIiOiIxLjAifQ.JRCOSS8b4nLGu5_G5wk0or-DzHYpOTaannGaLTeUXmkX5nUlhMeLIBAcZz2PhaNBSols6ExSNXH8ZPAeG8lsOQUey5AZyF8G5mYQYx6V2M5Lahqi5akAkTfwyx7BcWEShIvQVnJENZYbd4mz3QY2mFfAEbd6p50Tw621zHpkLdJB8Th1aO4j3NpUlQgorB9gFMdFbYUBeHmq9ZZdkECRRYVz_hjubzF3E0l2nCB6rmkkzL6Yl5Km6Z2i9YXuLS6z6FIsq_rCQClJ6ZA_LeFmbK2fvUrHLF4VDXowtp-0NGuQjdrArJzqe-U-nkb60Vj5adOdlES_WqRksvNDwoWhmA";

test("it should fail without bearer token", (t) => {
  validate(null, (err, valid, profile) => {
    t.equal(valid, false);
    t.end();
  });
});

test("it should pass with valid bearer token", (t) => {
  validate(token, (err, valid, profile) => {
    t.equal(valid, true, "valid token should pass");
    t.end();
  });
});
