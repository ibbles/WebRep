const express = require('express');
const router = express.Router();

var mongo = require('mongodb');

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
                        response.render('viewRecipe', {recipe: recipe});
                    } else if (recipes.length < 1) {
                        response.end('Didn\'t find any recipe named "' + recipeName + '" in database.');
                    } else {
                        response.end('Found more than one recipe named "' + recipeName + '" in database.');
                    }
                });
        })
        .catch(function (error) {
            console.log("Unable to connect to server.", error);
            response.end("Web server could not connect to database.");
        });
});

module.exports = router;