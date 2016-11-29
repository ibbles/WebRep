const express = require('express');
const router = express.Router();

var filesystem = require('fs');
const readline = require('readline');
var mongo = require('mongodb');
var iconv = require('iconv-lite');
const util = require('util');

var utils = require('WebRepLib');



function addRecipe(file, name, collection, response) {
    const path = 'Recipes/' + file;
    var encoding = utils.guessEncoding(path);
    console.log('Should insert "' + name + '" with encoding ' + encoding + '.');
    response.write('Should insert "' + name + '" with encoding ' + encoding + '.\n');

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
        if (recipe.title != name) {
            console.log('Recipe "' + recipe.title + '" stored in a file name "' + name + '". That\'s not right.');

            /// \todo(Emma): Cannot send error message to browser here because
            ///              the response has been ended already. Figure out how
            ///              to delay the call to response.end() until all processing
            ///              has completed.
            // response.write('Recipe "' + recipe.title + '" stored in a file name "' + name + '". That\'s not right.');
            return;
        }
        console.log("Fully parsed '" + file + '". Saving to database.');
        utils.saveRecipeToDatabase(recipeBuilder.recipeGetter());
    });

    return '"' + name + '" queued for insertion.';
}



function addRecipeIfNew(file, collection, response) {
    const pointPos = file.search('\.txt');
    const name = file.substring(0, pointPos);
    if (name === '') {
        return;
    }

    console.log('Performing find query for "' + name + '".');
    return collection.find({ title: name }, { title: true }).toArray()
        .then(function (recipes) {
            if (recipes.length == 0) {
                console.log('Recipe "' + name + '" not found, inserting.');
                return addRecipe(file, name, collection, response);
            } else {
                console.log('Should not insert "' + name + '".');
                response.write('Should not insert "' + name + '".\n');
                return '"' + name + '" not inserted.';
            }
        }).then(function (value) {
            return value;
        });
}


function isRecipe(file) {
    return file.endsWith(".txt");
}


function loopOverFiles(files, db, response) {
    var collection = db.collection("recipes");
    var queuedAdds = [];
    files.filter(isRecipe).forEach(function (file) {
        console.log('Recipe file "' + file + '" identified.');
        var maybe = addRecipeIfNew(file, collection, response);
        if (maybe !== undefined) {
            console.log('Action requried for "' + file + "'. Added to queue.");
            queuedAdds.push(maybe);
        }
    });
    Promise.all(queuedAdds).then(function () {
        console.log('All recipes has been looped over.');
        response.end();
    });
}


function addAllRecipesToDatabase(response) {
    console.log('addAllRecipesToDatabase wrapper called.');
    return function (db) {
        console.log('Database connection established.');
        console.log('addAllRecipesToDatabase implementation called.');
        filesystem.readdir('Recipes/', function (error, files) {
            console.log('readdir callback called.');
            if (error) { console.log(error); return; }
            loopOverFiles(files, db, response);
        });
    };
}


function databaseConnectionError(response) {
    return function (error) {
        console.log("Unable to connect to server.", error);
        response.end("Web server could not connect to database.");
    };
}


router.get('/', function (request, response) {
    console.log('Want to add all recipes.');

    var database = mongo.MongoClient;
    const url = "mongodb://localhost:27017/recipes";
    database.connect(url)
        .then(addAllRecipesToDatabase(response))
        .catch(databaseConnectionError(response));
});

module.exports = router;
