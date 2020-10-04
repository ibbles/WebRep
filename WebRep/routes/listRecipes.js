"use strict";

const express = require("express");
const router = express.Router();

const mongodb = require("mongodb");
const {MongoClient} = require("mongodb");

router.get('/', function(request, response){
    listRecipes(request, response);
});

async function listRecipes(request, response) {
    console.log("Connecting to database 'recipes'.");
    const url = "mongodb://localhost:27017/recipes";
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to recipes.");
        const collection = client.db("recipes").collection("recipes");
        const recipes = await collection.find({}, {title: true, categories: true}).toArray();
        console.log(recipes);

        response.send(recipes);
    } catch(exception) {
        console.error(exception);
    }
    finally {
        await client.close();
    }
}

router.get('/v1.0', function(request, response) {
    const database = mongodb.MongoClient;
    const url = "mongodb://localhost:27017/recipes";
    database.connect(url)
    .then(function(db) {
        console.log("Connection established.");
        const collection = db.collection("recipes");
        return collection.find({}, {title: true, categories: true}).toArray();
    })
    .then(function(recipeList) {
        console.log("Got "+ recipeList.length + " recipes.");
        var recipeGroups = {};
        recipeList.forEach(function (recipe) {
            var title = recipe.title;
            console.log("Looking at recipe '" + title + "' with categies '" + recipe.categories + "'.");
            for (var categoryKey in recipe.categories) {
                var category = recipe.categories[categoryKey][0];
                console.log("  Found '" + title + "' to have category '" + category + "'.");
                if (!recipeGroups.hasOwnProperty(category)) {
                    console.log("  First recipe in category '" + category + "'.");
                    recipeGroups[category] = [];
                }
                if (recipeGroups[category].indexOf(title) > -1) {
                    console.log("  Recipe already added, doing nothing.");
                } else {
                    recipeGroups[category].push(title);
                    console.log("  Add completed.");

                }
            }
        });

        var categories = [];
        for (var key in recipeGroups) {
            if (recipeGroups.hasOwnProperty(key)) {
                var recipes = recipeGroups[key];
                recipes.sort(function (lhs, rhs) {
                    if (lhs < rhs) {
                        return -1;
                    }
                    if (lhs == rhs) {
                        return 0;
                    }
                    if (lhs > rhs) {
                        return 1;
                    }
                });
                categories.push({category: key, recipes: recipes});
            }
        }

        categories.sort(function (rhs, lhs) {
            if (lhs.category > rhs.category) {
                return -1;
            }
            if (lhs.category == rhs.category) {
                return 0;
            }
            if (lhs.category < rhs.category) {
                return 1;
            }
        });

        response.render("listRecipes", {categories: categories});
    });
});

module.exports = router;