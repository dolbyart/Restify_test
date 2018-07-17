const sql = require('mssql'); // MS Sql Server client

//#region  GET

const get = (req, tableName, maxPerPage, key) => {

    let _TABLE_NAME = tableName;
    let _KEY = key;

    let queries = {
        page: null,
        per_page: null,
        orden: null,
        filter: null,
        fields: null
    };

    //console.log(req.query);

    Object.keys(req.query).forEach(queryName => {
        if (Object.keys(queries).includes(queryName))
            queries[queryName] = req.query[queryName];
        else
            throw new Error('Invalid query');
    });

    //console.log(queries);

    let paginate = false;
    let queryString = '';
    let fieldsString = '*';
    let filterString = '';

    /*  try {
         new sql.Request()
             .query(`SELECT ccu.COLUMN_NAME AS primaryKey
             FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc INNER JOIN
             INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS ccu ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
             WHERE (tc.CONSTRAINT_TYPE = 'Primary Key') AND (tc.TABLE_NAME = '${_TABLE_NAME}')`)
             .then(data => {
                 _KEY = data;
             }).catch(err => {
                 reject(err);
             });
     } catch (error) {
         throw new Error(error);
     } */

    /* _KEY = key === undefined ? `SELECT COLUMN_NAME
                                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                                WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + QUOTENAME(CONSTRAINT_NAME)), 'IsPrimaryKey') = 1
                                AND TABLE_NAME = '${_TABLE_NAME}' AND TABLE_SCHEMA = 'Schema'` : key; */


    let sortString = queries.orden ? queries.orden : `(${_KEY})`;

    if (queries.page || queries.per_page) {
        paginate = true;
        if (!queries.per_page)
            queries.per_page = maxPerPage;
        if (+queries.per_page > maxPerPage) {
            throw new Error(`No mas de ${maxPerPage} por pagina`);
            /* return new Promise((resolve, reject) => {
                reject(`No mas de ${maxPerPage} por pagina`);
            }); */
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
                    else
                        obj.totalRows = +obj.totalRows;
                    obj.totalPages = queries.per_page ? Math.ceil(obj.totalRows / queries.per_page) : 1;
                    obj.page = queries.page ? +queries.page : 1;
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