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

var mongo = require('mongodb').MongoClient;


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

    var currentIngredients = undefined;
    var currentDescription = undefined;

    /// Recipes follow a strict ordering of recipe elements. This tag keeps track
    /// of how far into the recipe we've come.
    var lastParsed = ''; // One of 'categories', 'title', 'servings', etc.
    
    /// Called when the next line of the recipe is expected to be the categories line.
    function parseCategories(line) {
        recipe.categories = [];
        var categoriesList = line.split(";");
        for (var i = 0; i < categoriesList.length-1; i = i+1) {
            var categoriesSublist = categoriesList[i].split(":");
            recipe.categories.push(categoriesSublist);
        }
        lastParsed = 'categories';
        return true;
    }

    /// Called when the next line of the recipe is expected to be the title.
    function parseTitle(line) {
        recipe.title = line;
        lastParsed = 'title';
        return true;
    }



    /// Called when the next line of the recipe is expected to be the servings.
    function parseServings(line) {
        recipe.servings = {};
        recipe.servings.quantity = Number(line.split(" ")[0]);
        recipe.servings.type = line.split(" ")[1]; 
        lastParsed = 'servings';
        return true;
    }


    function parseIngredients(line) {
        if (recipe.ingredients === undefined) {
            recipe.ingredients = [];
        }
        currentIngredients = {};
        recipe.ingredients.push(currentIngredients);
        currentIngredients.title = line.substr(1);
        currentIngredients.content = [];
        lastParsed = "ingredients";
    }

    function extractName(line) {
        var words = line.split(" ");
        var name = words[2];
        for (var i = 3; i < words.length; ++i) {
            var word = words[i];
            if (word[0] !== "(") {
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
            if (word[0] === "(") {
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
        var ingredient = {};
        ingredient.quantity = Number(line.split(" ")[0].replace(",", "."));
        ingredient.type = line.split(" ")[1];
        ingredient.name = extractName(line);
        ingredient.specifics = extractSpecifics(line);
        currentIngredients.content.push(ingredient);
    }


    function parseOvenTemp(line) {
        line = line.substr(1);
        var digits = "";
        for (var i = 0; i < line.length; ++i) {
            if (line[i] >= '0' && line[i] <= '9') {
                digits = digits.concat(line[i]);
            } else {
                break;
            }
        }

        recipe.ovenTemp = Number(digits);
    }
    
    function parseDescription(line)
    {
        if (recipe.description === undefined) {
            recipe.description = [];
        }

        /// \todo Create a new entry in the recipe.description array.
        ///       Save the created entry as currentDescription.
        currentDescription = {};
        currentDescription.title = undefined;
        currentDescription.content = [];
        var title = line.substr(1);
        if (title === "") {
            currentDescription.title = "Gör så här";
        } else {
            currentDescription.title = title;
        }
        recipe.description.push(currentDescription);
        lastParsed = 'description';
    }

    function parseDescriptionText(line) {
        currentDescription.content.push(line);
    }


    function parseTips(line) {
        recipe.tips = line.substr(1);
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
            } else if (lastParsed === "ingredients" && !isNaN(Number(line.split(" ")[0].replace(",", ".")))) {
                // Lines started with a number so must be an ingredient, right. Right? I hope so.
                parseIngredient(line);
            } else if (line[0] === '~') {
                parseOvenTemp(line);
            } else if (line[0] === '-' || line[0] === '+') {
                parseDescription(line);
            } else if (line[0] === '!') {
                parseTips(line);
            } else if (lastParsed === "description") {
                parseDescriptionText(line);
            } else {
                console.log("Don't know how to parse line '", line, "'.");
            }
        }
    };
}



function saveRecipeToDatabase(recipe) {
    mongo.connect('mongodb://127.0.0.1:27017/recipes', function (error, db) {
        if (error) {
            console.log("Could not connect to database.");
            throw error;
        }

        console.log("Connection to database established.");

        var collection = db.collection("recipes");
        collection.insert(recipe, function (error, docs) {
            if (error) {
                console.log("Could not insert recipe into database.");
                db.close();
                throw error;
            }
            console.log("Inserted", docs[0]);
            console.log("ID:", recipe._id);
            db.close();
        });
    });
}


/**
 * Entry point for the page. Reads a recipe from disk and prints it to the console.
 */
router.get('/', function(req, res) {
    // Extract recipe name from the URL.
    const recipeName = req.query.recipeName;
    
    // Open the recipe file as a line buffered stream.
    const fileStream = filesystem.createReadStream("Recipes/"+recipeName);
    const lines = readline.createInterface({
        input: fileStream,
        terminal: false
    });

    // Create the recipe builder and hook it up to the stream.
    var recipeBuilder = createRecipeBuilder();
    lines.on('line', recipeBuilder);
    lines.on('close', function() {
        console.log(util.inspect(getRecipe(), { showHidden: false, depth: null }));
        saveRecipeToDatabase(getRecipe());
        res.end("Recipe read.");
    });
});

module.exports = router;