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
const modelMethods = require('../../helpers/model-methods');

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
        } catch (error) { }
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

    //console.log(req.query);


    let queries = {
        host: req.headers.host,
        route: req.route.path,
        page: null,
        per_page: null,
        orden: null,
        filter: null,
        fields: null,
        table: null,
        mdl: null,
        key: null,
        maxPerPage: MAX_PER_PAGE
    };

    //console.log(queries);

    Object.keys(req.query).forEach(queryName => {
        if (Object.keys(queries).includes(queryName))
            queries[queryName] = req.query[queryName];
    });
    queries.mdl = queries.mdl.toLowerCase();
    queries.table = modelMethods.GetTableName(queries.mdl);

    queries.key = modelMethods.GetTableKey(queries.mdl);
    if (queries.fields) {
        queries.fields = modelMethods.MapFieldToTable(queries.mdl, queries.fields.split(' ').join('').split(',')).join(',');
        /* let f = [];
        queries.fields.split(' ').join('').split(',').forEach(field => {
            f.push(modelMethods.MapFieldToTable(queries.mdl, field));
        });
        queries.fields = f.join(','); */
        !queries.fields.includes(queries.key) ? queries.fields = (queries.fields + ',' + queries.key) : null;
    } else
        queries.fields = '*';

    console.log(queries);

    repo
        .get(queries)
        .then(data => {

            tracer.trackTrace(`get${req.query.mdl}`);
            tracer.trackEvent(`get${req.query.mdl}`);
            res.send(200, data);
        })
        .catch(err => {
            tracer.trackEvent(`get${req.query.mdl}Exception`);
            tracer.trackException(err);
            res.send(500, error.internal);
        });
});

router.get("/:id", (req, res, next) => {
    let queries = {
        id: +req.params.id,
        fields: null,
        mdl: null
    };

    Object.keys(req.query).forEach(queryName => {
        if (Object.keys(queries).includes(queryName))
            queries[queryName] = req.query[queryName];
        /*   else
              throw new Error('Invalid query'); */
    });
    queries.mdl = queries.mdl.toLowerCase();
    if (queries.fields)
        fieldsString = CheckFiledKey(queries.fields, KEY);
    else
        fieldsString = '*';


    repo
        .getById(queries)
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