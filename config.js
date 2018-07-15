module.exports = {
    max_per_page: 100,
    name: 'restify test',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    base_url: process.env.BASE_URL || 'http://localhost:3000',
    sqlConfig: {
        user: 'sa',
        password: 'dolby2000a*',
        server: 'localhost',
        database: 'TopDbase',
        driver: 'tedious'
        /* options: {
            database: 'TopDbase',
            //encrypt: true // Use this if you're on Windows Azure
        } */
    }
};