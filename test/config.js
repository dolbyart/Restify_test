const supertest = require('supertest');

const uri = process.env.BRAIN_URI;

console.log(`APY_URI: ${uri}`);

const apiClient = supertest.agent(uri);

exports.apiClient = apiClient;