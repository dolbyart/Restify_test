const restifyError = require('restify-errors');
const corsMiddleware = require('restify-cors-middleware');

const cors = corsMiddleware({
    preflightMaxAge: 5,
    origins: ['*'],
    allowHeaders: ['Authorization', 'Content-Type'],
    exposeHeaders: ['API-Token-Expiry'],
});

const init = (server, restify) => {
    server.pre(cors.preflight);
    server.use(cors.actual);
    server.use(restify.plugins.bodyParser({}));

    server.defaultResponseHeaders = (data) => {
        this.header('Content-Type', 'application/json');
    };

    server.use(restify.plugins.conditionalRequest());

    server.use(restify.plugins.queryParser());

    server.on('restifyError', (req, res, err, callback) => {
        err.toJSON = () => ({
            name: err.name,
            message: err.message,
        });
        console.log(`excepción:${err.toJSON()}`);

        err.toString = () => 'i just want a string';
        return callback();
    });
};

exports.set = init;