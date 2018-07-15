const restify = require('restify');
const config = require('./config');
//const errors = require('restify-errors');
//const corsMiddleware = require('restify-cors-middleware');
const sql = require('mssql'); // MS Sql Server client

const server = restify.createServer({
    name: config.name,
    version: config.version
});

server.listen(config.port, () => {
    console.info(`${server.name} is running on port ${config.port} url: ${config.base_url}`);
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
    console.info(`${req.method} - ${req.url}`);
    return next();
});

async function executeQuery(query) {
    return await new Promise((resolve, reject) => {
        new sql.connect(config.sqlConfig).then(pool => {
            // Query

            return pool.request()
                //.input('input_parameter', sql.Int, value)
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

//GET API
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
        obj.data.forEach(x => x.url = `${config.base_url}${req.route.path}/${x.DepartamentoId}`);
        executeQuery(`SELECT COUNT(DepartamentoId) as totalRows FROM dbo.Departamentos`).then((rowsCount) => {
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

    let obj = {
        prev: null,
        data: null,
        next: null
    };

    executeQuery(`SELECT * FROM dbo.Departamentos WHERE DepartamentoId = ${req.params.id}`).then((data) => {
        obj.data = data[0];
        executeQuery(`SELECT *
        FROM(
            SELECT
            [DepartamentoId],
            lag(DepartamentoId) over (order by DepartamentoId) as prev,
            lead(DepartamentoId) over (order by DepartamentoId) as next
            FROM dbo.Departamentos
        ) x
        WHERE ${req.params.id} IN (departamentoId,prev,next)`)

            //executeQuery(`SELECT DepartamentoId FROM [departamentos] ORDER BY departamentoId OFFSET ${(req.params.id-2)} ROWS FETCH NEXT 1 ROWS ONLY`)
            .then((prev) => {
                console.log(prev);
                obj.prev = prev;
                res.send(200, obj);

                //let paginatedResponse = res.paginate.getPaginatedResponse(data);
                next();
            }, (err) => {
                next(console.log(err));
            });
    }, (err) => {
        next(console.log(err));
    });
});

//POST API
server.post("/api/departamentos", (req, res, next) => {
    executeQuery(`INSERT INTO [departamentos] (Nombre) VALUES ('${req.body.nombre}')`).then(() => {
        res.send(201);
        next();
    }, (err) => {
        next(console.log(err));
    });
});

//PUT API
server.put('/api/departamentos/:id', (req, res, next) => {
    executeQuery(`UPDATE [departamentos] SET Nombre ='${req.body.nombre}' WHERE departamentoId = ${req.params.id}`).then(() => {
        res.send(200);
        next();
    }, (err) => {
        next(console.log(err));
    });
});

// DELETE API
server.del('/api/departamentos/:id', (req, res, next) => {
    executeQuery(`DELETE FROM [departamentos] WHERE departamentoId = ${req.params.id}`).then(() => {
        res.send(204);
        next();
    }, (err) => {
        next(console.log(err));
    });
});