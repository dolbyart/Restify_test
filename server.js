require('dotenv').config({
    path: 'env.env',
});
require('./helpers/validate-req').setDefaultMessages();

require('./helpers/redis');
const moment = require('moment');
const restify = require('restify');
const routes = require('./routes/routes');
require('./helpers/config.db').connect();
const tracer = require('./common/tracer')({});
const serverUse = require('./server.use');

moment.locale('es');

const server = restify.createServer({
    handleUncaughtExceptions: true,
});

serverUse.set(server, restify);
routes.applyRoutes(server);

server.pre((req, res, next) => {
    req.headers.accept = 'application/json';
    return next();
});

/* server.get('/api/status', (req, res) => {
    res.send('El servicio esta activo.');
}); */

server.listen(process.env.PORT, () => {
    tracer.trackTrace(`El servidor está online ${server.name} ${server.url}`);
});

module.exports = server;