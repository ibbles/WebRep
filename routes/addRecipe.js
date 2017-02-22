"use strict";

var express = require('express');
var router = express.Router();

var fs = require('fs');

/*
Display the recipe adder page. Let the user choose between either typing a
recipe into a text area, or selecting a recipe from a .txt on the server.

The text area is forwarded to 'addNewRecipe', while the file selection is
forwarded to 'parseRecipe'.
*/
router.get('/', function(request, response) {
    const mall = fs.readFileSync('Recipes/mall/~Mall~.txt');
    fs.readdir('Recipes/', function(error, files) {
        if (error) {
            response.end(error);
        }
        files = files.filter(function(file) {
            return file.endsWith(".txt");
        });
        response.render('addRecipe', {files: files, mall: mall});
    });
});

module.exports = router;
