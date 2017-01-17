/**
 * Given a recipe name in the query part of the URL, this page parses that recipe
 * from disk, builds a recipe JavaScript object and prints that to the console.
 * In later stages we might, for example, format the recipe as HTML and send to
 * the browser, or store it in the database. 
 */


/*
 * Assignments:
 *  - Filter out empty lines.
 *  - Split servings into a number part and a servings type (portioner, stycke, etc) part. 
 *  - Split categories at ';' and store as array.
 *  - Detect starts of ingredients (*Ingredienser).
 *  - Part ingredients lines. Split into amount, amount type and ingredient name. Store as array.
 *    [{amount: number, type: string, name: string}, ...]
 *  - Detect start of description (-). Store rest of file as description.
 */

const express = require('express');
const router = express.Router();

const filesystem = require('fs');
const readline = require('readline');

var iconv = require('iconv-lite');

const utils = require('WebRepLib');
const util = require('util');




/**
 * Entry point for the page. Reads a recipe from disk and prints it to the console.
 */
router.get('/', function(req, res) {
    // Extract recipe name from the URL.
    const recipeFileName = req.query.recipeName;

    const pointPos = recipeFileName.search('\.txt');
    const recipeName = recipeFileName.substring(0, pointPos);
    if (recipeName === '') {
        console.log('File "' + recipeFileName + '" does not name a valid recipe file.');
        res.end('File "' + recipeFileName + '" does not name a valid recipe file.');
        return;
    }

    const path = "Recipes/"+recipeName+".txt";
    const encoding = utils.guessEncoding(path);
    
    // Open the recipe file as a line buffered stream.
    const fileStream = filesystem.createReadStream(path).pipe(iconv.decodeStream(encoding));
    const lines = readline.createInterface({
        input: fileStream,
        terminal: false
    });

    // Create the recipe builder and hook it up to the stream.
    var recipeBuilder = utils.createRecipeBuilder();
    lines.on('line', recipeBuilder.parseLine);
    lines.on('close', function() {
        var recipe = recipeBuilder.recipeGetter();
        if (recipe.title != recipeName) {
            console.log('Recipe "' + recipe.title + '" stored in a file name "' + recipeName + '". That\'s not right.');
            res.end('Recipe "' + recipe.title + '" stored in a file name "' + recipeName + '". That\'s not right.');
            return;
        }
        console.log(util.inspect(recipeBuilder.recipeGetter(), { showHidden: false, depth: null }));
        utils.saveRecipeToDatabase(recipeBuilder.recipeGetter());
        res.end("Recipe read.");
    });
});

module.exports = router;