var express = require('express');
var router = express.Router();

/* GET graphs. */
router.get('/', function(req, res, next) {
	res.render('graphs', { title: 'Iazului Home Automation v2' });
});

module.exports = router;
