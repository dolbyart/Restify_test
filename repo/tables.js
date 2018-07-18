const sql = require("mssql");
const {
  roles
} = require("../common/roles");

const get = tableName => {

  return new Promise((resolve, reject) => {
    /* let queryString = `
    SELECT o.name AS TableName, Schema_name(o.schema_id) AS SchemaName
        FROM sys.objects AS o
        WHERE o.name = '${tableName}'

    SELECT c.name AS ColName, c.is_identity AS IsKey, t.name AS ColType, t.max_length AS TypeL, c.is_nullable AS IsNull
    FROM sys.columns AS c
    INNER JOIN sys.objects AS o ON o.object_id = c.object_id
    LEFT OUTER JOIN sys.types AS t ON t.user_type_id = c.user_type_id
    WHERE (o.type = 'U') AND (o.name = '${tableName}')`;
 */

    //Generate json/////////////
    let queryString = `
    SELECT o.name AS TableName, Schema_name(o.schema_id) AS SchemaName
        FROM sys.objects AS o
        WHERE o.name = '${tableName}'

    SELECT c.name AS ColName
    FROM sys.columns AS c
    INNER JOIN sys.objects AS o ON o.object_id = c.object_id
    LEFT OUTER JOIN sys.types AS t ON t.user_type_id = c.user_type_id
    WHERE (o.type = 'U') AND (o.name = '${tableName}')`;
    ////////////////////////////

    new sql.Request()
      .query(queryString)
      .then(data => {
        let obj = {
          TableName: data.recordsets[0][0].TableName,
          Schema: data.recordsets[0][0].SchemaName,

          //Generate json///////////////////
          Access: [],
          /////////////////////////////////

          Data: data.recordsets[1]
        };

        //Generate json///////////////////
        obj.Data.forEach(x => {
          x.Access = [];
        });
        /////////////////////////////////

        resolve(obj);
      })
      .catch(err => {
        reject(err);
      });
  });
};

exports.get = get;