"use strict";

var express = require('express');
var router = express.Router();

var mongodb = require("mongodb");

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {
        title: 'Recept',
        name: "Bucky"
    });
});

router.get("/thelist", function (reqest, response) {
    var database = mongodb.MongoClient,
        url = "mongodb://localhost:27017/recipies";
    database.connect(url, function (error, db) {
        if (error) {
            console.log("Unable to connect to server.", error);
        } else {
            console.log("Connection established.");
            var collection = db.collection("recipies");
            collection.find({}).toArray(function (error, result) {
                if (error) {
                    response.send(error);
                } else if (result.length) {
                    console.log("About to render page with the following recipies:");
                    result.forEach(function (recipie) {
                        console.log(recipie);
                    });
                    response.render('recipieslist', {
                        "recipieslist": result
                    });
                }
            });
        }
    });
});

module.exports = router;
