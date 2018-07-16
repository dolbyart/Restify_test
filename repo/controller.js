const sql = require('mssql'); // MS Sql Server client
require('dotenv').config({
    path: 'env.env'
});

let _TABLE_NAME = '';
let _KEY = '';
const maxPerPage = process.env.MAX_PER_PAGE;
let per_page = maxPerPage;
let page = 1;

//#region  GET

const get = (req, tableName, key) => {

    _TABLE_NAME = tableName;
    _KEY = key;

    let paginate = false;

    let queryString = '';

    if (Object.keys(req.query).length !== 0) {
        let sortString = req.query.sort !== undefined ? req.query.sort : '';
        if (req.query.page !== undefined || req.query.per_page !== undefined) {
            paginate = true;
            if (+req.query.per_page > maxPerPage) {
                return new Promise((resolve, reject) => {
                    reject(`No mas de ${maxPerPage} por pagina`);
                });
            }
            page = req.query.page !== undefined ? req.query.page : 1;
            if (req.query.per_page !== undefined)
                per_page = req.query.per_page;
            sortString === '' ? sortString = `${ _KEY} ASC` : null;
            queryString = `ORDER BY ${sortString} OFFSET ${(page - 1) * per_page} ROWS FETCH NEXT ${per_page} ROWS ONLY`;
        } else
            queryString = `ORDER BY ${sortString}`;

        let filterString = '';
    }

    let obj = {
        totalRows: null,
        totalPages: null,
        data: []
    };

    let totalRowsQuery = paginate ?
        `SELECT SUM(s.row_count) AS totalRows
        FROM sys.dm_db_partition_stats s
        WHERE s.[object_id] = OBJECT_ID('${_TABLE_NAME}')
        AND s.index_id < 2` : `SELECT NULL AS totalRows`;

    queryString = `${totalRowsQuery} SELECT * FROM ${_TABLE_NAME} ${queryString}`;

    return new Promise((resolve, reject) => {

        new sql.Request()
            .query(queryString)
            .then(data => {
                obj = data.recordsets[0][0];
                obj.data = data.recordsets[1];
                if (obj.data.length > 0) {
                    if (obj.totalRows === null)
                        obj.totalRows = obj.data.length;
                    obj.totalPages = Math.ceil(obj.totalRows / per_page);
                    obj.page = page;
                } else
                    obj.page = obj.totalRows = null;
                obj.data.forEach(x => x.url = `${req.headers.host}${req.route.path}${x[_KEY]}`);
                resolve(obj);
            }).catch(err => {
                reject(err);
            });
    });
};
//#endregion

exports.get = get;