"use strict";

var express = require('express');
var router = express.Router();

var fs = require('fs');

router.get('/', function(request, response) {
    fs.readdir('Recipes/', function(error, files) {
        if (error) { response.end(error); }
        response.render('addRecipe', {files: files});
    });
});

module.exports = router;
