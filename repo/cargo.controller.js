var sql = require('mssql'); // MS Sql Server client

class CargoController {

    getAll() {
        return fetch('https://jsonplaceholder.typicode.com/posts')
            .then(response => response.json());
    }
}

module.exports = new CargoController();