const sql = require("mssql");
const {
  roles
} = require("../common/roles");

const get = tableName => {

  return new Promise((resolve, reject) => {
    let queryString = `
        SELECT T.name AS TableName,Schema_name(T.schema_id) AS SchemaName
        FROM sys.tables AS T
        SELECT C.name AS ColName, C.is_identity AS Ikey, Ty.name AS ColType, Ty.max_length AS TypeL, C.is_nullable AS IsNull
        FROM sys.tables AS T
        INNER JOIN sys.columns AS C ON T.object_id = C.object_id
        INNER JOIN sys.types AS Ty ON C.system_type_id = Ty.system_type_id
        WHERE (T.is_ms_shipped = 0) AND (T.name <> 'sysdiagrams') AND (T.name = '${tableName}')`;

    new sql.Request()
      .query(queryString)
      .then(data => {
        let obj = {
          TableName: data.recordsets[0][0].TableName,
          Schema: data.recordsets[0][0].SchemaName,
          //Access: [roles.Admin, roles.Developer, roles.Usuario],
          Data: data.recordsets[1]
        };
        /* obj.Data.forEach(x => {
          x.Access = [roles.Admin, roles.Developer, roles.Usuario];
        }); */
        resolve(obj);
      })
      .catch(err => {
        reject(err);
      });
  });
};

exports.get = get;