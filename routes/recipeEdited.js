const express = require('express');
const router = express.Router();

const filesystem = require('fs');

const webrep = require('WebRepLib');

router.get('/', function(request, response) {
    const recipeText = request.query.content;

    const recipe = webrep.parseRecipeFromString(recipeText);

    /// \todo Consider making an isValid function for recipe.
    ///       What should it check?
    ///       Should we have a parseSuccessfull function instead?
    const invalid = recipe.title === '';
    if (invalid) {
        /// \todo We will need better error handling here.
        ///       At the very least we should send the browser back
        ///       to the edit page, with the edits intact.
        response.end("Recipe not valid.");
        return;
    }

    webrep.saveRecipeToDatabase(recipe, true);
    filename = 'Recipes/' + recipe.title + '.txt';
    filesystem.writeFileSync(filename, recipeText);
    response.render('viewRecipe', {recipe: recipe});
});

module.exports = router;
