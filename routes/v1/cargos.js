require('dotenv').config({
    path: 'env.env',
});
const restifyRouter = require('restify-router').Router;
const tracer = require('../../common/tracer')({});
const {
    error
} = require('../../helpers/error');

const router = new restifyRouter();

const repo = require('../../repo/controller');

router.get('/', (req, res, next) => {
    repo
        .get(req, 'dbo.Cargos', process.env.MAX_PER_PAGE, 'CargoId')
        .then((data) => {
            tracer.trackTrace(`getCargos`);
            tracer.trackEvent('getCargos');
            res.send(200, data);
        })
        .catch((err) => {
            tracer.trackEvent('getCargosException');
            tracer.trackException(err);
            res.send(500, error.internal);
        });
});

router.get('/:id', (req, res, next) => {
    repo
        .getById(+req.params.id, req, 'dbo.Cargos', 'CargoId')
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

router.post('', async (req, res, next) => {
    try {
        const endoso = buildDataEndoso(req, false);
        const errors = validateEndoso(endoso);

        if (errors) {
            res.send(400, {
                result: errors
            });
            return;
        }

        const newEndosoId = await endosoRepositorio.create(endoso);
        auditLog.createLog(req, res, newEndosoId, {
            newEndosoId
        });

        res.send(201, {
            newEndosoId
        });
    } catch (err) {
        tracer.trackEvent('createEndosoException');
        tracer.trackException(err);

        res.send(500, error.internal);
    }
});


module.exports = router;