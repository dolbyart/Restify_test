const restifyRouter = require('restify-router').Router;
const tracer = require('../../common/tracer')({});
const {
    error
} = require('../../helpers/error');

const router = new restifyRouter();

const repo = require('../../repo/cargo.controller');

router.get('/', (req, res, next) => {

    repo
        .getCargos()
        .then((data) => {
            tracer.trackTrace(`cargo: ${rut}`);
            tracer.trackEvent('cargo');

            res.send(200, {
                result: data,
            });
        })
        .catch((err) => {
            tracer.trackEvent('cargoException');
            tracer.trackException(err);
            res.send(500, error.internal);
        });

    return true;
});

module.exports = router;