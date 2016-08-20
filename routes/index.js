"use strict";

var express = require('express');
var router = express.Router();

var mongodb = require("mongodb");



router.get('/', function (req, res) {
    res.render('index', {
        title: 'Recept',
        recipieslist: [{tip: "tip1"}, {tip: "tip2"}, {tip: "tip3"}]
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
            var collection = db.collection("recipies");
            collection.find({}).toArray(function (error, result) {
                if (error) {
                    response.send(error);
                } else if (result.length) {
                    console.log("Got " + result.length + " recipes.");
                    console.log("About to render page with the following recipies:");
                    result.forEach(function (recipie) {
                        console.log(recipie);
                    });
                    response.render('recipieslist', {
                        "recipieslist": result
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

