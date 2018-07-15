let sql = require('mssql'); // MS Sql Server client
require('dotenv').config({
    path: 'env.env'
});

const _TABLE_NAME = 'dbo.Cargos';
const _KEY = 'CargoId';


//#region  GET

const getCargos = (req) => {



    let paginated = false;
    if (req.query.page !== undefined || req.query.per_page !== undefined)
        paginated = true;

    let queryString = '';

    if (Object.keys(req.query).length !== 0) {
        let sortString = '';
        req.query.sort !== undefined ? sortString = req.query.sort : sortString = `${ _KEY} ASC`;

        if (paginated) {
            if (+req.query.per_page > process.env.MAX_PER_PAGE) {
                return new Promise((resolve, reject) => {
                    reject(`No mas de ${process.env.MAX_PER_PAGE} por pagina`);
                });
            }

            let page = req.query.page !== undefined ? req.query.page : 1;

            let per_page = req.query.per_page !== undefined ? req.query.per_page : process.env.MAX_PER_PAGE;



            queryString = `ORDER BY ${sortString} OFFSET ${(page - 1) * per_page} ROWS FETCH NEXT ${per_page} ROWS ONLY`;
        } else
            queryString = `ORDER BY ${sortString}`;
    }

    let obj = {
        totalRows: 0,
        data: []
    };

    queryString = `SELECT * FROM ${_TABLE_NAME} ${queryString}`;

    console.log(queryString);

    return new Promise((resolve, reject) => {
        new sql.Request()
            .query(queryString)
            .then(data => {
                obj.data = data.recordset;
                obj.data.forEach(x => x.route = `${req.route.path}${ x.CargoId}`);

                resolve(obj);
            }).catch(err => {
                reject(err);
            });
    });

    /* executeQuery(queryString).then((data) => {
        obj.data = data;
        obj.data.forEach(x => x.url = urlById(req.route.path, x.DepartamentoId));
        executeQuery(`SELECT COUNT_BIG (*) AS totalRows FROM ${_DB_NAME}`).then((rowsCount) => {
            obj.totalRows = rowsCount[0].totalRows;
            res.send(200, obj);
            next();
        }, (err) => {
            next(console.log(err));
        });
    }, (err) => {
        next(console.log(err));
    }); */
};

/*  getCargos(req) {
     return new Promise((resolve, reject) => {

         resolve('ok');
     }).catch(err => {
         reject(err);
     });
 } */

/* getCargos(req) {

    let queryString = '';

    if (Object.keys(req.query).length !== 0) {
        let sortString = '';
        req.query.sort !== undefined ? sortString = req.query.sort : sortString = `${_KEY} ASC`;

        if (req.query.page !== undefined || req.query.per_page !== undefined) {
            if (req.query.per_page > config.max_per_page) {
                res.send(400, `No mas de ${process.env.MAX_PER_PAGE} por pagina`);
                next();
            }
            let page = req.query.page !== undefined ? req.query.page : 1;
            let per_page = req.query.per_page !== undefined ? req.query.per_page : process.env.MAX_PER_PAGE;

            queryString = `ORDER BY ${sortString} OFFSET ${(page - 1) * per_page} ROWS FETCH NEXT ${per_page} ROWS ONLY`;
        } else
            queryString = `ORDER BY ${sortString}`;
    }

    let obj = {
        totalRows: 0,
        data: []
    };

    queryString = `SELECT * FROM ${_DB_NAME} ${queryString}`;

    executeQuery(queryString).then((data) => {
        obj.data = data;
        obj.data.forEach(x => x.url = urlById(req.route.path, x.DepartamentoId));
        executeQuery(`SELECT COUNT(${_KEY}) AS totalRows FROM dbo.Departamentos`).then((rowsCount) => {
            obj.totalRows = rowsCount[0].totalRows;
            res.send(200, obj);
            next();
        }, (err) => {
            next(console.log(err));
        });
    }, (err) => {
        next(console.log(err));
    });        
} */
//#endregion


exports.getCargos = getCargos;