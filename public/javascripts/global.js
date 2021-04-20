// Recipelist data array for filling in info box
var recipeListData = [];

var editRecipeId = undefined;

// DOM Ready =============================================================
$(document).ready(function() {
  // Populate the recipe table on initial page load
  populateTable();

  $('#recipeList table tbody').on('click', 'td a.linkshowrecipe', showRecipeInfo);
  $('#recipeList table tbody').on('click', 'td a.linkdeleterecipe', deleteRecipe);
  $('#recipeList table tbody').on('click', 'td a.linkeditrecipe', editRecipe);
  $('#btnAddIngredient').on('click', addIngredientRow);
  $('#btnAddRecipe').on('click', addRecipe);
  $('#btnSaveRecipe').on('click', saveRecipe);
});

// Functions =============================================================

// Fill table with data
function populateTable() {

  // Empty content string
  var tableContent = '';

  // jQuery AJAX call for JSON
  $.getJSON( '/recipes/recipelist', function(data) {
    recipeListData = data;

    // For each item in our JSON, add a table row and cells to the content string
    $.each(data, function(){
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="linkshowrecipe" rel="' + this._id + '">' + this.recipename + '</a></td>';
      tableContent += '<td><a href="#" class="linkdeleterecipe" rel="' + this._id + '">delete</a></td>';
      tableContent += '<td><a href="#" class="linkeditrecipe" rel="' + this._id + '">edit</a></td>';
      tableContent += '</tr>';
    });

    // Inject the whole content string into our existing HTML table
    $('#recipeList table tbody').html(tableContent);
  });
};


function getRecipeObject(self) {
  var recipeId = $(self).attr('rel');
  var index = recipeListData.map(function(arrayItem) { return arrayItem._id;}).indexOf(recipeId);
  return recipeListData[index];
}


function showRecipeInfo(event) {
  event.preventDefault();

  var thisRecipeObject = getRecipeObject(this);
  $('#recipeInfoName').text(thisRecipeObject.recipename);
  var ingredientList = ''
  for (var i in thisRecipeObject.ingredients) {
    var ingredient = thisRecipeObject.ingredients[i]
    ingredientList += ingredient.amount + ' ';
    ingredientList += ingredient.unit + '\t';
    ingredientList += ingredient.name;
    if (ingredient.specification !== '') {
      ingredientList += ' (' + ingredient.specification + ')';
    }
    ingredientList += "</br>";
  }
  $('#recipeInfo output#ingredientList').html(ingredientList);
};


function verifyInputFields() {
  var haveChecked = false;
  var errorCount = 0;
  $('#addRecipe input').each(function(index, val) {
    haveChecked = true;
    if ($(this).val() === '') {
      errorCount++;
    }
  });

  if (!haveChecked) {
    alert('Error: Did not do any verification.');
    return false;
  }

  if (errorCount > 0) {
    alert('Please fill in all fields.');
    return false;
  }

  return true;
}


function getRecipeFromInputFields()
{
  var recipe = {
    'recipename': $('#addRecipe fieldset input#inputRecipeName').val(),
    'ingredients': []
  }
  $('#addRecipe fieldset p#ingredientList span#ingredient').each(function(index, value) {
    recipe.ingredients.push({
      'amount': value.children.inputIngredientAmount.value,
      'unit': value.children.inputIngredientUnit.value,
      'name': value.children.inputIngredientName.value,
      'specification': value.children.inputIngredientSpecification.value
    });
  });
  return recipe;
}


function addRecipe(event) {
  event.preventDefault();

  console.log("TODO: Commented out verification. Restore and fix.");
  // if (!verifyInputFields()) {
  //   return;
  // }

  var newRecipe = getRecipeFromInputFields();

  $.ajax({
    type: 'POST',
    data: {recipe: JSON.stringify(newRecipe)},
    url: '/recipes/addrecipe',
    dataType: 'JSON'
  }).done(function(response) {
    if (response.msg === '') {
      $('#addRecipe fieldset p#ingredientList').html('');
      $('#addRecipe fieldset input#inputRecipeName').val('');
      populateTable();
    }
    else {
      alert('Error: ' + response.msg);
    }
  });
}


function deleteRecipe(event) {
  event.preventDefault();

  var confirmation = confirm('Are your sure?');
  if (confirmation === true) {
    $.ajax({
      type: 'DELETE',
      url: '/recipes/deleterecipe/' + $(this).attr('rel')
    }).done(function(response) {
      if (response.msg !== '') {
        alert("Error: " + response.msg);
      }
      populateTable();
    });
  }
  else
  {
    return false;
  }
}


function createIngredientHtmlField(id, size, placeholder, value) {
  return '<input ' +
    'id="' + id + '" ' +
    'type="text" ' +
    'size="' + size + '" ' +
    'placeholder="' + placeholder + '" ' +
    'value="' + value + '"/>';
}


function createIngredientHtmlRow(amount, unit, name, specification) {
  var row = '<span id="ingredient">';
  row += createIngredientHtmlField('inputIngredientAmount', 5, 'Amount', amount);
  row += createIngredientHtmlField('inputIngredientUnit', 5, 'Unit', unit);
  row += createIngredientHtmlField('inputIngredientName', 20, 'Ingredient', name);
  row += createIngredientHtmlField('inputIngredientSpecification', 15, 'Specification', specification);
  row += '</span></br>';
  return row;
}


function addIngredientRow(event) {
  var currentRecipe = getRecipeFromInputFields();
  var ingredientsTable = ''
  $.each(currentRecipe.ingredients, function() {
    ingredientsTable += createIngredientHtmlRow(this.amount, this.unit, this.name, this.specification);
  });
  ingredientsTable += createIngredientHtmlRow('', '', '', '')
  $('#addRecipe fieldset p#ingredientList').html(ingredientsTable);
}


function editRecipe(event) {
  event.preventDefault();

  var thisRecipeObject = getRecipeObject(this);
  editRecipeId = thisRecipeObject._id;

  $('#addRecipe fieldset input#inputRecipeName').val(thisRecipeObject.recipename);

  var ingredientsTable = ''
  $.each(thisRecipeObject.ingredients, function() {
    ingredientsTable += createIngredientHtmlRow(this.amount, this.unit, this.name, this.specification);
  });

  $('#addRecipe fieldset p#ingredientList').html(ingredientsTable);
}


function saveRecipe(event) {
  event.preventDefault();

  if (editRecipeId === undefined) {
    alert("No edit in progress.");
    return;
  }

  console.log("TODO: Commented out verification. Restore and fix.");
  // if (!verifyInputFields()) {
  //   return;
  // }


  var editedRecipe = getRecipeFromInputFields();
  $.ajax({
    type: 'PUT',
    data: {recipe: JSON.stringify(editedRecipe)},
    url: '/recipes/editrecipe/' + editRecipeId,
    dataType: 'JSON'
  }).done(function(response) {
    if (response.msg === '') {
      $('#addRecipe fieldset input').val('');
      populateTable();
    }
    else {
      alert("Error: " + response.msg);
    }
  });

  editRecipeId = undefined;
}