const MAX_PER_PAGE = 50;

const restifyRouter = require('restify-router').Router;
const tracer = require('../../common/tracer')({});
const {
    error
} = require('../../helpers/error');

const router = new restifyRouter();

const repo = require('../../repo/ep');
const tablesModelrepo = require('../../repo/tables_model');
const userRole = require('../../common/user_role');


router.get('/gm/:tableName', (req, res, next) => {
    console.log(userRole.GetUserRole());
    tablesModelrepo
        .get(req.params.tableName)
        .then((data) => {
            tracer.trackTrace('getTableModel');
            tracer.trackEvent('getTableModel');
            //if (data.Access.includes(userRole.GetUserRole()))
            res.send(200, data)
            /* else
                res.send(401, 'No tiene permiso'); */
        })
        .catch((err) => {
            tracer.trackEvent('getTableModelException');
            tracer.trackException(err);
            res.send(500, error.internal);
        });
});


router.get('/', (req, res, next) => {

    if (req.query.per_page !== undefined) {

        if (req.query.per_page > MAX_PER_PAGE)
            return next(new errors.BadRequestError('max page error'));
    }
    repo
        .get(req, MAX_PER_PAGE /*, 'CargoId' */ )
        .then((data) => {
            tracer.trackTrace(`get${req.query.tbl}`);
            tracer.trackEvent(`get${req.query.tbl}`);
            res.send(200, data);
        })
        .catch((err) => {
            tracer.trackEvent(`get${req.query.tbl}Exception`);
            tracer.trackException(err);
            res.send(500, error.internal);
        });
});

router.get('/:id', (req, res, next) => {
    repo
        .getById(+req.params.id, req)
        .then((data) => {
            tracer.trackTrace(`get${req.query.tbl}ById`);
            tracer.trackEvent(`get${req.query.tbl}ById`);
            res.send(200, data);
        })
        .catch((err) => {
            tracer.trackEvent(`get${req.query.tbl}ByIdException`);
            tracer.trackException(err);
            res.send(500, error.internal);
        });
});

/* router.post('', async (req, res, next) => {
    
})); */


module.exports = router;