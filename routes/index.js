"use strict";

var express = require('express');
var router = express.Router();

var mongodb = require("mongodb");


router.get('/', function (req, res) {
    res.render('index', {
        title: 'Recept',
        recipeslist: [{tip: "tip1"}, {tip: "tip2"}, {tip: "tip3"}]
    });
});


router.get('/thelist', function(request, response) {
    var database = mongodb.MongoClient;
    var url = "mongodb://localhost:27017/recipes";
    database.connect(url)
        .then(function(db) {
            console.log("Connection established.");
            var collection = db.collection("recipes");
            collection.find({}, {title: true}).toArray()
                .then(function(result) {
                    console.log("Got " + result.length + " recipes after filter.");
                    console.log("About to render page with the following recipes:");
                    result.forEach(function (recipe) {
                        console.log(recipe);
                    });
                    response.render('recipeslist', {
                        "recipeslist": result
                    });
                });
        })
        .catch(function (error) {
            console.log("Unable to connect to server.", error);
            response.end("Web server could not connect to database.");
        });
});

module.exports = router;
