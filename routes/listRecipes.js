"use strict";

const express = require("express");
const router = express.Router();

const mongodb = require("mongodb");

router.get('/', function(request, response) {
    const database = mongodb.MongoClient;
    const url = "mongodb://localhost:27017/recipes";
    database.connect(url)
    .then(function(db) {
        const collection = db.collection("recipes");
        collection.find({}, {title: true, categories: true}).toArray()
        .then(function(recipeList) {
            db.close();
            var recipeGroups = {};
            recipeList.forEach(function (recipe) {
                var title = recipe.title;
                for (var categoryKey in recipe.categories) {
                    var category = recipe.categories[categoryKey][0];
                    if (!recipeGroups.hasOwnProperty(category)) {
                        recipeGroups[category] = [];
                    }
                    if (recipeGroups[category].indexOf(title) > -1) {
                        console.log("  Recipe already added, doing nothing.");
                    } else {
                        recipeGroups[category].push(title);
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
});

module.exports = router;