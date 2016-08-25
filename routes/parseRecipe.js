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
const util = require('util');


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
    recipe.ingredients = [];

    var currentIngredients = undefined;

    /// Recipes follow a strict ordering of recipe elements. This tag keeps track
    /// of how far into the recipe we've come.
    var lastParsed = ''; // One of 'categories', 'title', 'servings', etc.
    
    /// Called when the next line of the recipe is expected to be the categories line.
    function parseCategories(line) {
        console.log('Parsing categories from "' + line + '".');
        
        /// \todo Proper parsing of categories here.
        recipe.categories = [];
        var categoriesList = line.split(";");
        console.log("Have " + categoriesList.length + " categories");
        for (var i = 0; i < categoriesList.length-1; i = i+1) {
            console.log(i + ": '" + categoriesList[i] + "'.");
            var categoriesSublist = categoriesList[i].split(":");
            recipe.categories.push(categoriesSublist);
        }
        console.log(categoriesList);
        lastParsed = 'categories';
        return true;
    }

    /// Called when the next line of the recipe is expected to be the title.
    function parseTitle(line) {
        console.log('Parsing Title from "' + line + '".');

        recipe.title = line;

        lastParsed = 'title';
        return true;
    }

    /// Called when the next line of the recipe is expected to be the servings.
    function parseServings(line) {
        console.log('Parsing servings from "' + line + '".');

        /// \todo Proper parsing of servings here.
        recipe.servings = {};
        recipe.servings.quantity = Number(line.split(" ")[0]);
        recipe.servings.type = line.split(" ")[1]; 


        console.log("Serving '" + recipe.servings.quantity + "' '" + recipe.servings.type + "'.");

        lastParsed = 'servings';
        return true;
    }


    function parseIngredients(line) {
        currentIngredients = {};
        recipe.ingredients.push(currentIngredients);
        currentIngredients.title = line.substr(1);
        currentIngredients.content = [];
    }

    function extractName(line) {
        var words = line.split(" ");
        var name = words[2];
        for (var i = 3; i < words.length; ++i) {
            var word = words[i];
            if (!word[0] == ("(")) {
                name = name.concat(" ", word);
            } else {
                return name;
            }
        }

        return name;
    }

    function extractSpecifics(line) {
        var words = line.split(" ");
        var specifics = "";
        for (var i = 2; i < words.length; ++i) {
            var word = words[i];
            if (word[0] == "(") {
                for (var j = i; j < words.length; ++j) {
                    specifics = specifics.concat(" ", words[j]);
                }
                specifics = specifics.substring(2, specifics.length-1);
            }
        }
        return specifics;
    }

    function parseIngredient(line) {
        line = line.replace(RegExp("\\s+", "g"), " ");
        var columns = line.split(RegExp("\\s"));
        console.log("Ingredient '" + line + "' is split into:");
        console.log(columns);
        var ingredient = {};
        ingredient.quantity = Number(line.split(" ")[0].replace(",", "."));
        ingredient.type = line.split(" ")[1];
        ingredient.name = extractName(line);
        ingredient.specifics = extractSpecifics(line);
        currentIngredients.content.push(ingredient);
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
        line = line.trim();
        if (line === "") {
            return;
        }

        // Determine how far into the recipe we've already come.
        if (lastParsed === '') {
            parseCategories(line);
        }
        else if (lastParsed === 'categories') {
            parseTitle(line);
        }
        else if (lastParsed === 'title') {
            parseServings(line);
        }
        //else if (lastParsed === 'servings') {
         //   console.log('TODO: Implement more line types');
        //}
        else {
            // Classify the next line.
            // Is one of
            //   *<title>
            //   ~<temperature>
            //   -
            //   +<title>
            //   !<tips>
            if (line[0] === '*') {
                parseIngredients(line);
            } else if (!isNaN(Number(line.split(" ")[0].replace(",", ".")))) {
                // Lines started with a number, must be an ingredient.
                parseIngredient(line);
            } else if (line[0] === '~') {

            } else if (line[0] === '-') {

            } else if (line[0] === '+') {

            } else if (line[0] === '!') {

            } else {
                console.log("Don't know how to parse '"+line+"'.");
            }
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
        console.log('\n\nEnd of file. Recipe better be complete by now.');
        console.log(util.inspect(getRecipe(), { showHidden: true, depth: null }));
        res.send("End of recipe reached."+getRecipe());
    });
});

module.exports = router;