const restifyRouter = require('restify-router').Router;
require('dotenv').config({
    path: 'env.env',
});

const router = new restifyRouter();

router.add(`/${process.env.API_VERSION}`, require(`./${process.env.API_VERSION}/routes`));

module.exports = router;