const restifyRouter = require('restify-router').Router;
require('dotenv').config({
    path: 'env.env',
});

const router = new restifyRouter();

router.add('/v1', require('./v1/routes'));

module.exports = router;