const MAX_PER_PAGE = 50;

const restifyRouter = require("restify-router").Router;
const tracer = require("../../common/tracer")({});
const {
    error
} = require("../../helpers/error");

const router = new restifyRouter();

const repo = require("../../repo/ep");
const modelsRepo = require("../../repo/models");
const userRole = require("../../common/user_role");
const _ = require('lodash');
const chalk = require('chalk');

router.get('/createmodels/', (req, res, next) => {
    let tables = [];
    let allowedTables = [];
    tables = req.query.table
        .toLowerCase()
        .split(" ")
        .join("")
        .split(",");
    model = req.query.model
        .toLowerCase()
        .split(" ")
        .join("")
        .split(",");
    console.log(chalk.blue('Table: ', table, '  Model: ', model));

});

router.get('/metadata/', (req, res, next) => {
    const role = userRole.GetUserRole();

    let tables = req.query.tables
        .toLowerCase()
        .split(" ")
        .join("")
        .split(",");

    tables.forEach(table => {
        try {
            if (_.intersection([role, -1], require(`../../models/${table}.json`).Allow.Roles).length > 0)
                allowedTables.push(table);
        } catch (error) {}
    });

    console.log(allowedTables);

    if (allowedTables.length > 0) {

        modelsRepo
            .getTable(allowedTables)
            .then(data => {
                tracer.trackTrace("getTableModel");
                tracer.trackEvent("getTableModel");

                res.send(200, data);

                /*  try {

                     //DEV JSON CREATION 
                     require(`../../models/${data.TableName}.json`).Access = [0];
                     ///////////////////

                     if (require(`../../models/${data.TableName}.json`).Access.includes(userRole.GetUserRole())) {
                         res.send(200, data);
                     } else res.send(401, "No tiene permiso");
                 } catch (err) {
                     res.send(401, 'No tiene permiso');
                 } */

                //console.log(model);
                //if (data.Access.includes(userRole.GetUserRole()))

                /* else
                 */
            })
            .catch(err => {
                tracer.trackEvent("getTableModelException");
                tracer.trackException(err);
                res.send(500, error.internal);
            });
    } else
        res.send(204, 'Recurso no encontrado');
});

router.get("/", (req, res, next) => {
    if (req.query.per_page !== undefined) {
        if (req.query.per_page > MAX_PER_PAGE)
            return next(new errors.BadRequestError("max page error"));
    }
    repo
        .get(req, MAX_PER_PAGE /*, 'CargoId' */ )
        .then(data => {
            tracer.trackTrace(`get${req.query.t}`);
            tracer.trackEvent(`get${req.query.t}`);
            res.send(200, data);
        })
        .catch(err => {
            tracer.trackEvent(`get${req.query.t}Exception`);
            tracer.trackException(err);
            res.send(500, error.internal);
        });
});

router.get("/:id", (req, res, next) => {
    repo
        .getById(+req.params.id, req)
        .then(data => {
            tracer.trackTrace(`get${req.query.tbl}ById`);
            tracer.trackEvent(`get${req.query.tbl}ById`);
            res.send(200, data);
        })
        .catch(err => {
            tracer.trackEvent(`get${req.query.tbl}ByIdException`);
            tracer.trackException(err);
            res.send(500, error.internal);
        });
});

/* router.post('', async (req, res, next) => {
    
})); */

module.exports = router;