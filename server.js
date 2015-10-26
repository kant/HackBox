// bootstrap server with babel require hook
// so whole project can be written in ES6
require("babel/register");
require("./index");

process.stdout.write(JSON.stringify(process.env, null, 2));
