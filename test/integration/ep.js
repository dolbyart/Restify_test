/* eslint-env node, mocha */
const {
    apiClient
} = require('../config');
const {
    assert
} = require('chai');


describe('brain api', () => {
    it('get data', function call(done) {
        this.timeout(10000);
        apiClient
            .get('/v1/ep/?tbl=persona&key=Id')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) done(err);
                else done();
            });
    });
});