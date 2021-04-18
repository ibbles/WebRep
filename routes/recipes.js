var express = require('express');
var router = express.Router();

/* GET userlist. */
router.get('/recipelist', function(req, res, next) {
  var db = req.db;
  var collection = db.get('recipelist');
  collection.find({}, {}, function(e, docs) {
    res.json(docs);
  });
});

router.post('/addrecipe', function(req, res) {
  var db = req.db;
  var collection = db.get('recipelist');
  collection.insert(req.body, function(err, result) {
    res.send((err === null) ? {msg: ''} : {msg: err});
  });
});

router.delete('/deleterecipe/:id', function(req, res) {
  var db = req.db;
  var collection = db.get('recipelist');
  var recipeToDelete = req.params.id;
  collection.remove({'_id': recipeToDelete}, function(err) {
    res.send((err === null) ? {msg: ''} : {msg: err});
  });
});

router.put('/editrecipe/:id', function(req, res) {
  var db = req.db;
  var collection = db.get('recipelist');
  var recipeToEdit = req.params.id;
  var recipe = JSON.parse(req.body.recipe);
  collection.update({'_id': recipeToEdit}, { $set: recipe}, function(err, result) {
    res.send((err === null) ? {msg: ''} : {msg: err.message});
  });
});

module.exports = router;
