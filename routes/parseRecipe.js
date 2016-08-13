/**
 * Given a recipe name in the query part of the URL, this page parses that recipe
 * from disk, builds a recipe JavaScript object and prints that to the console.
 * In later stages we might, for example, format the recipe as HTML and send to
 * the browser, or store it in the database. 
 */


const express = require('express');
const router = express.Router();

const filesystem = require('fs');
const readline = require('readline');


// Global name of a function defined inside createRecipeBuilder that returns the
// last read recipe.
//
/// \note I don't think this is thread safe. If two recipes are being parsed at
///       the same time, then I guess the first user will see the second user's
///       recipe. That would be bad. 
var getRecipe;


/**
 * Constructor function that create a recipe builder object.
 * 
 * The recipe builder is a function that takes a single string argument and is
 * intended to be called for every line in a recipe text file. The recipe builder
 * captures a scope that contains helper function and intermediate results used
 * to construct the recipe object.
 */
function createRecipeBuilder() {
    /// This is the object that is being filled in with every call to one of the
    /// parse.+ functions.
    var recipe = {};

    /// Recipes follow a strict ordering of recipe elements. This tag keeps track
    /// of how far into the recipe we've come.
    var lastParsed = ''; // One of 'categories', 'name', 'servings', etc.
    
    /// Called when the next line of the recipe is expected to be the categories line.
    function parseCategories(line) {
        console.log('Parsing categories from "' + line + '".');
        
        /// \todo Proper parsing of categories here.
        recipe.categories = line;
        
        lastParsed = 'categories';
        return true;
    }

    /// Called when the next line of the recipe is expected to be the name.
    function parseName(line) {
        console.log('Parsing name from "' + line + '".');

        /// \todo Proper parsing of name here.
        recipe.name = line;

        lastParsed = 'name';
        return true;
    }

    /// Called when the next line of the recipe is expected to be the servings.
    function parseServings(line) {
        console.log('Parsing servings from "' + line + '".');

        /// \todo Proper parsing of servings here.
        recipe.servings = line;

        lastParsed = 'servings';
        return true;
    }


    /// Public getter function. Returns the recipe we just started parsin.
    /// Don't call this until the recipe has been completely parsed.
    ///
    /// \note This is the part the breaks if multiple recipes are being read in concurrently.
    getRecipe = function() {
        return recipe;
    };


    /// Called for every line of the recipe.
    return function(line) {
        // Determine how far into the recipe we've already come.
        if (lastParsed === '') {
            parseCategories(line);
        }
        else if (lastParsed === 'categories') {
            parseName(line);
        }
        else if (lastParsed === 'name') {
            parseServings(line);
        }
        else if (lastParsed === 'servings') {
            console.log('TODO: Implement more line types');
        }
        else {
            /// \todo What to do here?
        }
    };
}


/**
 * Entry point for the page. Reads a recipe from disk and prints it to the console.
 */
router.get('/', function(req, res) {
    // Extract recipe name from the URL.
    const recipeName = req.query.recipeName;
    console.log('Reading recipe "'+recipeName+'" from "'+process.cwd()+'".');
    
    // Open the recipe file as a line buffered stream.
    const fileStream = filesystem.createReadStream(recipeName);
    const lines = readline.createInterface({
        input: fileStream,
        terminal: false
    });

    // Create the recipe builder and hook it up to the stream.
    var recipeBuilder = createRecipeBuilder();
    lines.on('line', recipeBuilder);
    lines.on('close', function() {
        console.log('End of file. Recipe better be complete by now.');
        console.log(getRecipe());
        res.send("End of recipe reached."+getRecipe());
    });
});

module.exports = router;