const MAX_PER_PAGE = 50;

const restifyRouter = require('restify-router').Router;
const tracer = require('../../common/tracer')({});
const {
    error
} = require('../../helpers/error');

const router = new restifyRouter();

const repo = require('../../repo/ep');
const tablesModelrepo = require('../../repo/tables');
const userRole = require('../../common/user_role');
const fs = require('fs');


router.get('/gm/', (req, res, next) => {
    const role = userRole.GetUserRole();
    let tables = req.query.t.toLowerCase().split(' ').join('').split(',');

    let allowedTables = [];
    tables.forEach(table => {
        try {
            console.log(table);
            if (require(`../../models/${table}.json`).Access.includes(role))
                allowedTables.push(table);
        } catch (error) {

        }

    });

    /*  let models = [];
     fs.readdirSync(`${process.cwd()}/models/`).forEach(file => {
         if (require(`../../models/${file}`).Access.includes(role))
             models.push(file.replace(/\.[^/.]+$/, ""));
     }); */

    //console.log(models);
    console.log(allowedTables);

    tablesModelrepo
        .get(tables)
        .then((data) => {
            tracer.trackTrace('getTableModel');
            tracer.trackEvent('getTableModel');

            try {
                let model = require(`../../models/${data.TableName}.json`);

                /* //DEV JSON CREATION 
                let model = {
                    Access: [0]
                };
                /////////////////// */

                if (model.Access.includes(userRole.GetUserRole())) {
                    res.send(200, data);
                } else
                    res.send(401, 'No tiene permiso');
            } catch (err) {
                res.send(401, 'No tiene permiso');
            }

            //console.log(model);
            //if (data.Access.includes(userRole.GetUserRole()))

            /* else
             */
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