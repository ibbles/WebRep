console.log("WebRep: Initialization sequence initialized.");

var wrLib = require('WebRepLib');

wrLib.log("Loading third-party libraries.");
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

wrLib.log("Loading routes.");
var routes = require('./routes/index');
var users = require('./routes/users');
var addRecipe = require('./routes/addRecipe');
var readRecipe = require('./routes/readRecipe');
var parseRecipe = require('./routes/parseRecipe');
var addAllRecipes = require('./routes/addAllRecipes');
var addNewRecipe = require('./routes/addNewRecipe');
var viewRecipe = require('./routes/viewRecipe');
var editRecipe = require('./routes/editRecipe');
var recipeEdited = require('./routes/recipeEdited');

wrLib.log("Creating application");
var app = express();

// View engine setup.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

wrLib.log("Configuring application.");
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

wrLib.log("Connecting routes");
app.use('/', routes);
app.use('/users', users);
app.use('/addRecipe', addRecipe);
app.use('/readRecipe', readRecipe);
app.use('/parseRecipe', parseRecipe);
app.use('/addAllRecipes', addAllRecipes);
app.use('/addNewRecipe', addNewRecipe);
app.use('/viewRecipe', viewRecipe);
app.use('/editRecipe', editRecipe);
app.use('/recipeEdited', recipeEdited);
app.use(favicon(__dirname + '/Images/Icons/Food-Dome-32.png'));

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

wrLib.log("Application fully initialized.");
