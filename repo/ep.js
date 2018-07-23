const sql = require('mssql');
const modelMethods = require('../helpers/model-methods');


//#region GET

const get = (queries) => {

    const MODEL_NAME = queries.mdl;
    const TABLE_NAME = queries.table;
    const MAX_PER_PAGE = queries.maxPerPage;
    const KEY = queries.key;

    let paginate = false;
    let queryString = '';

    let filterString = '';

    let sortString = queries.orden ? queries.orden : `(${KEY})`;

    if (queries.page || queries.per_page) {
        paginate = true;
        if (!queries.per_page)
            queries.per_page = MAX_PER_PAGE;
        /*  if (+queries.per_page > MAX_PER_PAGE) {
             throw new Error(`No mas de ${MAX_PER_PAGE} por pagina`);
             return new Promise((resolve, reject) => {
                 reject(`No mas de ${MAX_PER_PAGE} por pagina`);
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

    queryString = `${totalRowsQuery} SELECT ${queries.fields} FROM ${TABLE_NAME} ${filterString} ${queryString}`;

    console.log(queryString);

    let obj = {
        columnInfo: [],
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
                //obj.columns.entries().map(c => modelMethods.GetTModel(queries.mdl).Columns);
                if (obj.data.length > 0) {
                    if (obj.totalRows === null)
                        obj.totalRows = obj.data.length;
                    else
                        obj.totalRows = +obj.totalRows;
                    obj.totalPages = queries.per_page ? Math.ceil(obj.totalRows / queries.per_page) : 1;
                    obj.page = queries.page ? +queries.page : 1;
                } else
                    obj.page = obj.totalRows = null;

                obj.columnInfo = [];

                obj.data.forEach(x => {
                    Object.keys(x).forEach(field => {
                        let modelColName = modelMethods.MapFieldsToModel(queries.mdl, field).ModelColName;
                        //let newField = modelMethods.MapFieldsToModel(queries.mdl, field).ModelColName;
                        if (field !== modelColName) {
                            Object.defineProperty(x, modelColName,
                                Object.getOwnPropertyDescriptor(x, field));
                            delete x[field];
                        }
                        /* console.log(modelMethods.getModelColumnsType(queries.mdl, modelColName)); */

                    });

                    //obj.columnInfo.push(modelMethods.getModelColumnsType(queries.mdl, field));


                    //obj.columnInfo.push(modelMethods.getModelColumnsType(x));
                });

                //Object.keys(obj.data[0]).forEach

                obj.data.map(x => x.url = `${queries.host}${queries.route}${x[KEY]}?mdl=${MODEL_NAME}`);

                /* let model = modelMethods.GetTModel(queries.mdl);

                Object.entries(obj.columns).map(c => model.Columns.find(m => c.ModelColName === c.key)); */

                resolve(obj);
            }).catch(err => {
                reject(err);
            });
    });
};

const getById = (id, req /* , tableName, key */) => {


    const TABLE_NAME = queries.mdl;
    const KEY = queries.key;

    let fieldsString = '';


    const queryString = `
       SELECT TOP 1 * FROM(
        SELECT ${fieldsString},
        LAG(${KEY}) OVER (ORDER BY ${KEY}) AS prevUrl,
        LEAD(${KEY}) OVER (ORDER BY ${KEY}) AS nextUrl
        FROM ${TABLE_NAME}
       ) x WHERE ${KEY} = @Id`;

    console.log(queryString);

    return new Promise((resolve, reject) => {
        new sql.Request()
            .input('Id', sql.BigInt, id)
            .query(queryString)
            .then((data) => {
                let obj = data.recordset[0];
                obj.prevUrl = obj.prevUrl !== null ? obj.prevUrl = `${req.headers.host}${req.route.path.substr(0, req.route.path.indexOf(':'))}${obj.prevUrl}?mdl=${TABLE_NAME}&key=${KEY}` : null;
                obj.nextUrl = obj.nextUrl !== null ? obj.nextUrl = `${req.headers.host}${req.route.path.substr(0, req.route.path.indexOf(':'))}${obj.nextUrl}?mdl=${TABLE_NAME}&key=${KEY}` : null;
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