const getTableName = (modelName) => {
    let model = getModel(modelName);
    return (model.Schema + '.' + model.TableName);
    //return roles.Developer;
    //return roles.Usuario;
};

const getTableKey = (modelName) => {
    let model = getModel(modelName);
    let key = model.Columns.find(x => x.ModelColName === model.Key).ColName;
    return key;
};

const mapFieldToTable = (modelName, fields) => {
    return fields.map(x => getModel(modelName).Columns.find(c => c.ModelColName === x).ColName);
};

const mapFieldsToModel = (modelName, fields) => {
    return getModel(modelName).Columns.find(c => c.ColName === fields);
};

const getModel = (modelName) => {
    return require(`../models/${modelName}.json`);
};

const getModelColumnsType = (modelName) => {
    console.log(modelColName);
    let columnInfo = getModel(modelName).Columns.map.find(c => c.ModelColName === modelColName);
    return {
        modelColName: columnInfo.ModelColName,
        idKey: columnInfo.IdKey,
        colType: columnInfo.ColType,
        typeL: columnInfo.TypeL,
        isNull: columnInfo.IsNull,
        def: columnInfo.Def
    }
}

exports.GetTModel = getModel;
exports.GetTableKey = getTableKey;
exports.GetTableName = getTableName;
exports.MapFieldToTable = mapFieldToTable;
exports.MapFieldsToModel = mapFieldsToModel;
exports.getModelColumnsType = getModelColumnsType;