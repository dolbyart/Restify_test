const sql = require('mssql'); // MS Sql Server client


function CheckFiledKey(fields, key) {
    let f = fields.split(' ').join('').split(',');
    !f.includes(key) ? f.push(key) : null;
    return f.join(',');
}

//#region GET

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

    Object.keys(req.query).forEach(queryName => {
        if (Object.keys(queries).includes(queryName))
            queries[queryName] = req.query[queryName];
        else
            throw new Error('Invalid query');
    });

    //console.log(queries);

    let paginate = false;
    let queryString = '';

    let fieldsString = '';
    if (queries.fields)
        fieldsString = CheckFiledKey(queries.fields, key);
    else
        fieldsString = '*';

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

    let obj = {
        totalRows: null,
        totalPages: null,
        data: []
    };
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

const getById = (id, req, tableName, key) => {

    let _TABLE_NAME = tableName;
    let _KEY = key;

    let fieldsString = '';
    if (req.query.fields)
        fieldsString = CheckFiledKey(req.query.fields, key);
    else
        fieldsString = '*';

    const queryString = `
       SELECT * FROM(
        SELECT ${fieldsString},
        LAG(${_KEY}) OVER (ORDER BY ${_KEY}) AS prevUrl,
        LEAD(${_KEY}) OVER (ORDER BY ${_KEY}) AS nextUrl
        FROM ${_TABLE_NAME}
       ) x WHERE ${_KEY} = @Id`;

    console.log(queryString);

    return new Promise((resolve, reject) => {
        new sql.Request()
            .input('Id', sql.BigInt, id)
            .query(queryString)
            .then((data) => {
                let obj = data.recordset[0];
                obj.prevUrl = obj.prevUrl !== null ? obj.prevUrl = `${req.headers.host}${req.route.path.substr(0, req.route.path.indexOf(':'))}${obj.prevUrl}` : null;
                obj.nextUrl = obj.nextUrl !== null ? obj.nextUrl = `${req.headers.host}${req.route.path.substr(0, req.route.path.indexOf(':'))}${obj.nextUrl}` : null;
                resolve(obj);
            })
            .catch((err) => {
                reject(err);
            });
    });
};
//#endregion

//#region POST

//#endregion

//#region PUT

//#endregion

//#region DELETE

//#endregion
exports.get = get;
exports.getById = getById;