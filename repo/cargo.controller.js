let sql = require('mssql'); // MS Sql Server client
const tracer = require('../common/tracer')({});
class CargoController {

    getCargos(req) {

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

        const sqlQuery = `
    SELECT 
      Id,
      Nombre,
      Gentilicio,
      Vigente
    FROM dbo.Pais
    WHERE Vigente = @Vigente
    `;

        return new Promise((resolve, reject) => {
            new sql.Request()
                .input('Vigente', sql.Bit, Activo.Vigente)
                .query(`${sqlQuery}`)
                .then((result) => {
                    resolve(result.recordsets[0]);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}

module.exports = new CargoController();