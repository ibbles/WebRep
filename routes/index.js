"use strict";

var express = require('express');
var router = express.Router();

var mongodb = require("mongodb");
//var Q = require("q");



router.get('/', function (req, res) {
    res.render('index', {
        title: 'Recept',
        recipeslist: [{tip: "tip1"}, {tip: "tip2"}, {tip: "tip3"}]
    });
});


router.get('/thelist_q', function(request, response) {
    var database = mongodb.MongoClient;
    var url = "mongodb://localhost:27017/recipes";
    database.connect(url)
        .then(function(db) {
            console.log("Connection established.");
            var collection = db.collection("recipes");
            collection.find({}).toArray()
                .then(function(result) {
                    console.log("Got " + result.length + " recipes.");
                    console.log("About to render page with the following recipes:");
                    result.forEach(function (recipe) {
                        console.log(recipe);
                    });
                    response.render('recipeslist', {
                        "recipeslist": result
                    });
                });
                /*

                .error(function(error) {
                    console.log("Unable to fetch recipes from database: "+error);
                    response.end("Unable to fetch recipes from database");
                })*/
        })
        .catch(function (error) {
            console.log("Unable to connect to server.", error);
            response.end("Web server could not connect to database.");
        });
});



router.get("/thelist", function (reqest, response) {
    var database = mongodb.MongoClient;
    var url = "mongodb://localhost:27017/recipes";
    database.connect(url, function (error, db) {
        if (error) {
            console.log("Unable to connect to server.", error);
            response.write("Web server could not connect to database.");
            response.end();
        } else {
            console.log("Connection established.");
            var collection = db.collection("recipes");
            collection.find({}).toArray(function (error, result) {
                if (error) {
                    response.send(error);
                } else if (result.length) {
                    console.log("Got " + result.length + " recipes.");
                    console.log("About to render page with the following recipes:");
                    result.forEach(function (recipie) {
                        console.log(recipie);
                    });
                    response.render('recipeslist', {
                        "recipeslist": result
                    });
                } else {
                    console.log("Got no recipes. Databse is empty.");
                    response.write("There are no recipes in the database.");
                    response.end();
                }
            });
        }
    });
});

module.exports = router;
