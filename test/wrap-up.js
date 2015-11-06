// without this the process hangs and doesn't exit
import test from "tape";
import server from "../index";

test("server shutdown", (t) => {
  server.stop(() => {});
  t.end();
});
