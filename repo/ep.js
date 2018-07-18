const sql = require('mssql');

function CheckFiledKey(fields, key) {
    let f = fields.split(' ').join('').split(',');
    !f.includes(key) ? f.push(key) : null;
    return f.join(',');
}

//#region GET

const get = (req, maxPerPage /*,  tableName, key */ ) => {

    //console.log(req.query);

    let queries = {
        page: null,
        per_page: null,
        orden: null,
        filter: null,
        fields: null,
        tbl: null,
        key: null
    };

    Object.keys(req.query).forEach(queryName => {
        if (Object.keys(queries).includes(queryName))
            queries[queryName] = req.query[queryName];
        /*   else
              throw new Error('Invalid query'); */
    });

    //console.log(queries);

    const TABLE_NAME = `dbo.${queries.tbl}`;

    const KEY = queries.key;

    let paginate = false;
    let queryString = '';

    let fieldsString = '';
    if (queries.fields)
        fieldsString = CheckFiledKey(queries.fields, KEY);
    else
        fieldsString = '*';

    let filterString = '';

    let sortString = queries.orden ? queries.orden : `(${KEY})`;

    if (queries.page || queries.per_page) {
        paginate = true;
        if (!queries.per_page)
            queries.per_page = maxPerPage;
        /*  if (+queries.per_page > maxPerPage) {
             throw new Error(`No mas de ${maxPerPage} por pagina`);
             return new Promise((resolve, reject) => {
                 reject(`No mas de ${maxPerPage} por pagina`);
             });
         } */
        if (!queries.page)
            queries.page = 1;
        queryString = `ORDER BY ${sortString} OFFSET ${(queries.page - 1) * queries.per_page} ROWS FETCH NEXT ${queries.per_page} ROWS ONLY`;
    } else if (queries.orden)
        queryString = `ORDER BY ${sortString}`;

    let totalRowsQuery = `SELECT NULL AS totalRows`;
    if (queries.filter) {
        filterString = `WHERE ${queries.filter.split(':').join('=').split('(*)').join('%')}`;
        totalRowsQuery = `SELECT COUNT_BIG(*) AS totalRows
        FROM ${TABLE_NAME} ${filterString}`;
    } else if (paginate)
        totalRowsQuery = `SELECT SUM(s.row_count) AS totalRows
                            FROM sys.dm_db_partition_stats s
                            WHERE s.[object_id] = OBJECT_ID('${TABLE_NAME}')
                            AND s.index_id < 2`;

    queryString = `${totalRowsQuery} SELECT ${fieldsString} FROM ${TABLE_NAME} ${filterString} ${queryString}`;

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

                obj.data.forEach(x => x.url = `${req.headers.host}${req.route.path}${x[KEY]}?tbl=${TABLE_NAME}&key=${KEY}`);
                resolve(obj);
            }).catch(err => {
                reject(err);
            });
    });
};

const getById = (id, req /* , tableName, key */ ) => {

    let queries = {
        fields: null,
        tbl: null,
        key: null
    };

    Object.keys(req.query).forEach(queryName => {
        if (Object.keys(queries).includes(queryName))
            queries[queryName] = req.query[queryName];
        /*   else
              throw new Error('Invalid query'); */
    });
    const TABLE_NAME = queries.tbl;
    const KEY = queries.key;

    let fieldsString = '';
    if (queries.fields)
        fieldsString = CheckFiledKey(queries.fields, KEY);
    else
        fieldsString = '*';

    const queryString = `
       SELECT TOP 1 * FROM(
        SELECT ${fieldsString},
        LAG(${KEY}) OVER (ORDER BY ${KEY}) AS prevUrl,
        LEAD(${KEY}) OVER (ORDER BY ${KEY}) AS nextUrl
        FROM ${TABLE_NAME}
       ) u WHERE ${KEY} = @Id`;

    console.log(queryString);

    return new Promise((resolve, reject) => {
        new sql.Request()
            .input('Id', sql.BigInt, id)
            .query(queryString)
            .then((data) => {
                let obj = data.recordset[0];
                obj.prevUrl = obj.prevUrl !== null ? obj.prevUrl = `${req.headers.host}${req.route.path.substr(0, req.route.path.indexOf(':'))}${obj.prevUrl}?tbl=${TABLE_NAME}&key=${KEY}` : null;
                obj.nextUrl = obj.nextUrl !== null ? obj.nextUrl = `${req.headers.host}${req.route.path.substr(0, req.route.path.indexOf(':'))}${obj.nextUrl}?tbl=${TABLE_NAME}&key=${KEY}` : null;
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