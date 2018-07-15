const restifyRouter = require('restify-router').Router;
const tracer = require('../../common/tracer')({});
const {
    error
} = require('../../helpers/error');

const router = new restifyRouter();

const repo = require('../../repo/cargos.controller');

router.get('/', (req, res, next) => {

    repo
        .getCargos(req)
        .then((data) => {
            tracer.trackTrace(`cargos`);
            tracer.trackEvent('cargos');
            res.send(200, data);
        })
        .catch((err) => {
            tracer.trackEvent('cargosException');
            tracer.trackException(err);
            res.send(500, error.internal);
        });
});

router.get('/:id', (req, res, next) => {
    paisesRepo
        .getCargoById(+req.params.id)
        .then((data) => {
            tracer.trackTrace('getCargoById');
            tracer.trackEvent('getCargoById');
            res.send(200, data);
        })
        .catch((err) => {
            tracer.trackEvent('getCargoByIdException');
            tracer.trackException(err);
            res.send(500, error.internal);
        });
});


module.exports = router;