const express = require('express');
const router = express.Router();

const mongo = require('mongodb');
const iconv = require('iconv-lite');
const filesystem = require('fs');

const webreputils = require('WebRepLib');

router.get('/', function(request, response) {
    const recipeName = request.query.recipe;
    const database = mongo.MongoClient;
    const url = "mongodb://localhost:27017/recipes";

    database.connect(url)
    .then(function (db) {
        var collection = db.collection('recipes');
        collection.find({title: recipeName}).toArray()
        .then(function (recipes) {
            db.close();
            if (recipes.length == 1) {
                const path = "Recipes/"+recipeName+".txt";
                const encoding = webreputils.guessEncoding(path);
                const rawContent = filesystem.readFileSync(path);
                const oldContent = iconv.decode(rawContent, encoding);
                response.render('editRecipe', {recipeName: recipeName, oldContent: oldContent});
            } else if (recipes.length == 0) {
                response.end('No recipe named ' + recipeName + '.');
            } else if (recipes.length > 0) {
                response.end('Multiple recipes named ' + recipeName + '. That\'s unexpected.');
            }
        });
    });
});

module.exports = router;