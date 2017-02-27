"use strict";

var express = require('express');
var router = express.Router();

const utils = require('WebRepLib');
const util = require('util');
const fs = require('fs');

router.get('/', function(request, response) {
    const content = request.query.content;
    console.log('Got the following recipe:');
    console.log(content);

    var trimmedContent = "";

    var recipeBuilder = utils.createRecipeBuilder();
    const lines = content.split('\n');
    lines.forEach(function(line) {
        line = line.trim();
        console.log('Line: <' + line + '>');
        recipeBuilder.parseLine(line);
        trimmedContent = trimmedContent + '\n' + line;
    });

    const recipe = recipeBuilder.recipeGetter();

    console.log(util.inspect(recipe, {
        showHidden: false, depth: null
    }));
    
    const invalid = recipe.title === '';
    if (invalid) {
        console.log('Recipe is invalid.');
        response.end('Recipe is invalid.');
        return;
    }

    /// \todo Dangerous to write the recipe to file before saving to database
    ///       since the database may reject the new recipe.
    ///       Dangerous to do the other way as well since the write to file
    ///       may fail.
    ///
    ///      Which should we do first?
    const filename = 'Recipes/' + recipe.title + '.txt';
    fs.writeFileSync(filename, trimmedContent);
    console.log('Recipe saved to "' + filename);
    utils.saveRecipeToDatabase(recipe, false)
    .then(function() {
        response.end(trimmedContent);
    })
    .catch(function(message) {
        response.end(message);
    });

    
});

module.exports = router;