const restifyRouter = require('restify-router').Router;

const router = new restifyRouter();

/* router.add('/auth', require('./auth'));
router.add('/user', require('./user'));
router.add('/denuncia', require('./denuncia'));
router.add('/orden', require('./orden'));
router.add('/decreto', require('./decreto'));
router.add('/endoso', require('./endoso'));
router.add('/swagger', require('./swagger'));
router.add('/unidad', require('./unidad')); */

router.add('/ep', require('./ep'));


module.exports = router;