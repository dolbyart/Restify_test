const sql = require('mssql'); // MS Sql Server client

//#region  GET

const get = (req, tableName, key, maxPerPage) => {

    let _TABLE_NAME = tableName;
    let _KEY = key;

    let queries = {
        page: null,
        per_page: null,
        orden: null,
        filter: null
    };

    //console.log(req.query);

    Object.keys(req.query).forEach(queryName => {
        if (Object.keys(queries).includes(queryName))
            queries[queryName] = req.query[queryName];
        /*   else
              throw new Error('Invalid query'); */
    });

    //console.log(queries);

    let paginate = false;
    let queryString = '';
    let fieldsString = '*';
    let filterString = '';


    let sortString = queries.orden ? queries.orden : `${ _KEY} ASC`;

    if (queries.page !== null || queries.per_page !== null) {
        paginate = true;
        if (!queries.per_page)
            queries.per_page = maxPerPage;
        if (+queries.per_page > maxPerPage) {
            return new Promise((resolve, reject) => {
                reject(`No mas de ${maxPerPage} por pagina`);
            });
        }
        queryString = `ORDER BY ${sortString} OFFSET ${(queries.page - 1) * queries.per_page} ROWS FETCH NEXT ${queries.per_page} ROWS ONLY`;
    } else if (queries.orden)
        queryString = `ORDER BY ${sortString}`;


    let obj = {
        totalRows: null,
        totalPages: null,
        data: []
    };

    let totalRowsQuery = `SELECT NULL AS totalRows`;
    if (queries.filter) {
        filterString = `WHERE ${queries.filter.split(':').join('=').split('(*)').join('%')}`;
        totalRowsQuery = `SELECT COUNT_BIG(*) AS totalRows
        FROM ${_TABLE_NAME} ${filterString}`;
    } else if (paginate)
        totalRowsQuery = `SELECT SUM(s.row_count) AS totalRows
                            FROM sys.dm_db_partition_stats s
                            WHERE s.[object_id] = OBJECT_ID('${_TABLE_NAME}')
                            AND s.index_id < 2`;

    queryString = `${totalRowsQuery} SELECT ${fieldsString} FROM ${_TABLE_NAME} ${filterString} ${queryString}`;

    console.log(queryString);

    return new Promise((resolve, reject) => {

        new sql.Request()
            .query(queryString)
            .then(data => {
                obj = data.recordsets[0][0];
                obj.data = data.recordsets[1];
                if (obj.data.length > 0) {
                    if (obj.totalRows === null)
                        obj.totalRows = obj.data.length;
                    obj.totalPages = queries.per_page ? Math.ceil(obj.totalRows / queries.per_page) : 1;
                    obj.page = queries.page ? queries.page : 1;
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