require('dotenv').config({
    path: 'env.env',
});
const restify = require('restify');
require('./helpers/config.db').connect();
//const errors = require('restify-errors');
//const corsMiddleware = require('restify-cors-middleware');
const sql = require('mssql'); // MS Sql Server client

const server = restify.createServer({
    handleUncaughtExceptions: true,
});

server.listen(process.env.PORT, () => {
    console.info(`${server.name} is running on port ${process.env.PORT} url: ${server.url}`);
});


/* const cors = corsMiddleware({
    origins: ['*'],
    allowHeaders: ['X-App-Version'],
    exposeHeaders: []
});

server.pre(cors.preflight);
server.use(cors.actual); */

//server.use(restify.plugins.bodyParser());

server.use(restify.plugins.queryParser());
//server.use(restify.queryParser());


server.pre((req, res, next) => {
    console.info(`${req.method} - ${server.url} ${req.url}`);
    return next();
});

function urlById(route, id) {
    return `${config.base_url}${route}/${id}`;
}

async function executeQuery(query) {
    return await new Promise((resolve, reject) => {
        new sql.connect(config.sqlConfig).then(pool => {
            // Query

            return pool.request()
                .query(query)
        }).then(result => {
            resolve(result.recordset);
            sql.close();
        }).catch(err => {
            reject(err);
            sql.close();
        });
    });
}

/* async function executeQuery(query) {
    return await new Promise((resolve, reject) => {
        new sql.ConnectionPool(config.sqlConfig).connect().then(pool => {
                return pool.request().query(query);
            })
            .then(result => {
                resolve(result.recordset);
                sql.close();
            }).catch(err => {
                reject(err);
                sql.close();
            });
    });
} */

const config = {
    max_per_page: 50,

}

//#region GET API
server.get('/api/departamentos', (req, res, next) => {

    let queryString = '';

    if (Object.keys(req.query).length !== 0) {
        let sortString = '';
        req.query.sort !== undefined ? sortString = req.query.sort : sortString = 'DepartamentoId asc';

        if (req.query.page !== undefined || req.query.per_page !== undefined) {
            if (req.query.per_page > config.max_per_page) {
                res.send(400, `No mas de ${config.max_per_page} por pagina`);
                next();
            }
            let page = req.query.page !== undefined ? req.query.page : 1;
            let per_page = req.query.per_page !== undefined ? req.query.per_page : config.max_per_page;

            queryString = `ORDER BY ${sortString} OFFSET ${(page - 1) * per_page} ROWS FETCH NEXT ${per_page} ROWS ONLY`;
        } else
            queryString = `ORDER BY ${sortString}`;

    }

    let obj = {
        totalRows: 0,
        data: []
    };

    executeQuery(`SELECT * FROM dbo.Departamentos ${queryString}`).then((data) => {
        obj.data = data;
        obj.data.forEach(x => x.url = urlById(req.route.path, x.DepartamentoId));
        executeQuery(`SELECT COUNT(DepartamentoId) AS totalRows FROM dbo.Departamentos`).then((rowsCount) => {
            obj.totalRows = rowsCount[0].totalRows;
            res.send(200, obj);
            next();
        }, (err) => {
            next(console.log(err));
        });
    }, (err) => {
        next(console.log(err));
    });

});


server.get('/api/departamentos/:id', (req, res, next) => {

    executeQuery(`SELECT *
    FROM(
        SELECT *,
        LAG(DepartamentoId) OVER (ORDER BY DepartamentoId) AS prevUrl,
        LEAD(DepartamentoId) OVER (ORDER BY DepartamentoId) AS nextUrl
        FROM dbo.Departamentos
    ) x
    WHERE DepartamentoId = ${req.params.id}`)
        .then((data) => {
            data[0].prevUrl !== null ? data[0].prevUrl = urlById(req.route.path.substr(0, req.route.path.indexOf('/:')), data[0].prevUrl) : null;
            data[0].nextUrl !== null ? data[0].nextUrl = urlById(req.route.path.substr(0, req.route.path.indexOf('/:')), data[0].nextUrl) : null;
            res.send(200, data);
            next();
        }, (err) => {
            next(console.log(err));
        });
});

//#endregion

//#region POST API
server.post("/api/departamentos", (req, res, next) => {
    executeQuery(`INSERT INTO dbo.Departamentos (Nombre) VALUES ('${req.body.nombre}')`).then(() => {
        res.send(201);
        next();
    }, (err) => {
        next(console.log(err));
    });
});
//#endregion

//#region PUT API
server.put('/api/departamentos/:id', (req, res, next) => {
    executeQuery(`UPDATE dbo.Departamentos SET Nombre ='${req.body.nombre}' WHERE DepartamentoId = ${req.params.id}`).then(() => {
        res.send(200);
        next();
    }, (err) => {
        next(console.log(err));
    });
});
//#endregion

//#region DELETE API
server.del('/api/departamentos/:id', (req, res, next) => {
    executeQuery(`DELETE FROM dbo.Departamentos WHERE DepartamentoId = ${req.params.id}`).then(() => {
        res.send(204);
        next();
    }, (err) => {
        next(console.log(err));
    });
});
//#endregion