var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('helloworld', { title: 'My Hello World' });
});

module.exports = router;
