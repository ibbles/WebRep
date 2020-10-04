const express = require('express');
const router = express.Router();

const filesystem = require('fs');
const readline = require('readline');

// The iconv library is used to convert between character encodings.
// We may convert all on-disk recipes into UTF-8.
const iconv = require('iconv-lite');

const WebRepLib = require("WebRepLib");
const fileHandler = WebRepLib.fileHandler;
const recipeParser = WebRepLib.recipeParser;
const log = WebRepLib.log.log;

router.get('/', function(request, response) {
    addRecipeFromFile(request, response, "Banankaka");
    addRecipeFromFile(request, response, "Astrids Pepparkakor");
    //addRecipeFromFile(request, response, "Tacogratäng med Röda Linser");
});


async function addRecipeFromFile(request, response, recipeName) {
    // Read the file 'recipe_name' from disk into 'recipe'.
    console.log("Recipe contents from disk:");

    const recipeFileName = recipeName + '.txt'
    const recipePath = "public/recipes/"+recipeFileName;

    const encoding = fileHandler.guessEncoding(recipePath);
    const input = filesystem.createReadStream(recipePath).pipe(iconv.decodeStream(encoding));
    const reader = readline.createInterface({input: input, terminal: false});

    // Create recipe builder.
    var recipeBuilder = recipeParser.createRecipeBuilder();
    // Send line by line from recipe to builder.
    reader.on("line", function(line) {
        if (!recipeBuilder.parseLine(line.trim())) {
            log("Detected parse error, should not continue.\n\n\n");
        }
    });
    reader.on("close", function() {
        // Get recipe from builder.
        const recipe = recipeBuilder.getRecipe();
        // Save recipe to database.
        console.log(recipe);
        response.send(recipe);
        // TODO: Code here.
    });
}


module.exports = router;
