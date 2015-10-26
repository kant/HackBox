// bootstrap server with babel require hook
// so whole project can be written in ES6
require("babel/register");
require("./index");

/*
var http = require('http');
var port = process.env.port || 1337;
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
*/
