import Hapi from 'hapi';
import Good from 'good'
import GoodConsole from 'good-console';

const server = new Hapi.Server({ debug: { request: ['error'] } });
const port = process.env.PORT || 3000;

server.connection({
  host: '0.0.0.0',
  port: port,
  routes: {
    cors: {
      credentials: true,
    },
  },
});

server.register([
  {
    register: Good,
    options: {
      reporters: [{
        reporter: GoodConsole,
        events: { log: '*', response: '*' },
      }],
    },
  },
  // my routes
  //require('./routes/instructors'),
], function(err) {
  if (err) {
    console.error(err);
  }

  server.start(function() {
    console.info('api server started at ' + server.info.uri);
  });
});

module.exports = server;
