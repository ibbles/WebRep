const express = require('express');
const router = express.Router();

var mongo = require('mongodb');
var filesystem = require('fs');

router.get('/', function(request, response) {
    const recipeName = request.query.recipe;
    var database = mongo.MongoClient;
    const url = "mongodb://localhost:27017/recipes";

    database.connect(url)
        .then(function (db) {
            console.log("Connection established.");
            var collection = db.collection("recipes");
            collection.find({title: recipeName}).toArray()
                .then(function (recipes) {
                    console.log('Found ' + recipes.length + ' recipes named "' +recipeName + '".');
                    if (recipes.length == 1) {
                        const recipe = recipes[0];
                        image_base = "public/RecipeImages/" + recipe.title + "_M"
                        if (filesystem.existsSync(image_base + ".jpg")) {
                            image_suffix = "jpg"
                        } else if (filesystem.existsSync(image_base + ".png")) {
                            image_suffix = "png"
                        } else {
                            image_suffix = "" // No suffix means no image.
                        }
                        response.render('viewRecipe', {recipe: recipe, image_suffix: image_suffix});
                    } else {
                        collection.find({title: {$regex: ".*"+recipeName+".*", $options: "i"}}).toArray()
                        .then(function (recipes) {
                            response.render('recipeslist', {
                                "recipeslist": recipes
                            });
                        });
                    }
                });
        })
        .catch(function (error) {
            console.log("Unable to connect to server.", error);
            response.end("Web server could not connect to database.");
        });
});

module.exports = router;