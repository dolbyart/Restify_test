let sql = require('mssql'); // MS Sql Server client
require('dotenv').config({
    path: 'env.env'
});

const _TABLE_NAME = 'dbo.Cargos';
const _KEY = 'CargoId';
const _MAX_PER_PAGE = process.env.MAX_PER_PAGE;

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
            if (+req.query.per_page > _MAX_PER_PAGE) {
                return new Promise((resolve, reject) => {
                    reject(`No mas de ${_MAX_PER_PAGE} por pagina`);
                });
            }
            let page = req.query.page !== undefined ? req.query.page : 1;
            let per_page = req.query.per_page !== undefined ? req.query.per_page : _MAX_PER_PAGE;
            queryString = `ORDER BY ${sortString} OFFSET ${(page - 1) * per_page} ROWS FETCH NEXT ${per_page} ROWS ONLY`;
        } else
            queryString = `ORDER BY ${sortString}`;
    }

    let obj = {
        totalRows: 0,
        data: []
    };
    queryString = `SELECT
                    SUM(s.row_count) AS totalRows
                    FROM sys.dm_db_partition_stats s
                    WHERE s.[object_id] = OBJECT_ID('${_TABLE_NAME}')
                    AND s.index_id < 2
                    SELECT * FROM ${_TABLE_NAME} ${queryString}`;

    return new Promise((resolve, reject) => {
        new sql.Request()
            .query(queryString)
            .then(data => {
                obj = data.recordsets[0][0];
                obj.data = data.recordsets[1];
                obj.data.forEach(x => x.route = `${req.route.path}${ x.CargoId}`);

                resolve(obj);
            }).catch(err => {
                reject(err);
            });
    });
};
//#endregion

exports.getCargos = getCargos;