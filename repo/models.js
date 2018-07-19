const sql = require("mssql");
const {
  Roles
} = require("../common/enums");
var _ = require('lodash');
const fs = require("fs");

const createModel = (modelName) => {
  require(`../models/tables_mapping.json`).find(x => x.ModelName === modelName);
};

const recreateModels = (modelName) => {
  try {
    let model = require(`../models/${modelName}.json`);

  } catch (err) {
    throw new Error('Modelo no existe');
  }

};

const getModel = tableName => {

  //AND(o.name IN('PersonaDocumento', 'Persona'))

  return new Promise((resolve, reject) => {
    let queryString = `
    SELECT o.name AS TableName, Schema_name(o.schema_id) AS SchemaName
        FROM sys.objects AS o
        WHERE o.name = '${tableName}'

    SELECT c.name AS ColName, c.is_identity AS IdKey, t.name AS ColType, t.max_length AS TypeL, c.is_nullable AS IsNull,
    object_definition(c.default_object_id) AS Def
    FROM sys.columns AS c
    INNER JOIN sys.objects AS o ON o.object_id = c.object_id
    LEFT OUTER JOIN sys.types AS t ON t.user_type_id = c.user_type_id
    WHERE (o.type = 'U') AND (o.name = '${tableName}')`;




    /* //Generate json/////////////
    let queryString = `
    SELECT o.name AS TableName, Schema_name(o.schema_id) AS SchemaName
        FROM sys.objects AS o
        WHERE o.name = '${tableName}'

    SELECT c.name AS ColName
    FROM sys.columns AS c
    INNER JOIN sys.objects AS o ON o.object_id = c.object_id
    LEFT OUTER JOIN sys.types AS t ON t.user_type_id = c.user_type_id
    WHERE (o.type = 'U') AND (o.name = '${tableName}')`;
    //////////////////////////// */

    console.log(queryString);

    new sql.Request()
      .query(queryString)
      .then(data => {

        /*  var result = _(data)
           .groupBy(x => x.color)
           .map((value, key) => ({
             color: key,
             users: value
           }))
           .value(); */

        let obj = {
          ModelName: data.recordsets[0][0].TableName,
          Model: {
            TableName: data.recordsets[0][0].TableName,
            Schema: data.recordsets[0][0].SchemaName,

            //Generate json///////////////////
            Allow: {
              Users: [],
              Roles: [],
              Groups: []
            },
            /////////////////////////////////

            Columns: data.recordsets[1]
          }
          //Generate json///////////////////
        };

        obj.Model.Columns.forEach(x => {
          x.ModelColName = obj.ModelName + x.ColName,
            x.Allow = {
              Users: [],
              Roles: [],
              Groups: []
            };
          /////////////////////////////////          
        });

        resolve(obj);
      })
      .catch(err => {
        reject(err);
      });
  });
};

exports.getModel = getModel;