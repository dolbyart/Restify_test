const sql = require('mssql');
const tracer = require('../common/tracer')({});

const config = {
    user: process.env.DB_USER_NAME,
    password: process.env.DB_USER_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
    },
    port: process.env.DB_PORT,
    dialect: 'mssql',
    connectionTimeout: 60000,
    dialectOptions: {
        database: process.env.DB_NAME,
        instanceName: process.env.DB_INSTANCE_NAME,
    },
};

exports.connect = (cb) => {
    sql.connect(config, (err) => {
        if (err) {
            tracer.trackException(err);
            throw err;
        }
        tracer.trackTrace('connected');
        if (cb) {
            cb();
        }
    });
};