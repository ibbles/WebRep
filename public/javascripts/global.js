// Recipelist data array for filling in info box
var recipeListData = [];

var editRecipeId = undefined;

var available_units = [
  'ml',
  'kr',
  'ts',
  'ms',
  'dl',
  'l',
  'g',
  'kg',
  'st',
  'sats'
];

// DOM Ready =============================================================
$(document).ready(function() {
  // Populate the recipe table on initial page load
  populateTable();

  $('#recipeList table tbody').on('click', 'td a.linkshowrecipe', showRecipeInfo);
  $('#recipeList table tbody').on('click', 'td a.linkdeleterecipe', deleteRecipe);
  $('#recipeList table tbody').on('click', 'td a.linkeditrecipe', prepareRecipeEdit);
  $('#btnAddIngredient').on('click', addIngredientRow);
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

function isNumeric(string) {
  return !isNaN(string.replace(',', '.'));
}

function verifyInputFields() {
  var haveChecked = false;
  var errorCount = 0;

  if ($('#addRecipe fieldset input#inputRecipeName').val() === '') {
    errorCount++;
  }

  $('#addRecipe fieldset p#ingredientList span#ingredient').each(function(index, value) {
    haveChecked = true;
    var fields = value.children;
    if (!isNumeric(fields.inputIngredientAmount.value)) {
      errorCount++;
    }

    if (fields.inputIngredientUnit.value === '') {
      errorCount++;
    }

    if (fields.inputIngredientName.value === '') {
      errorCount++
    }
  });

  if (!haveChecked) {
    alert('Error: Did not do any verification.');
    return false;
  }

  if (errorCount > 0) {
    alert('Please fill in all fields. Num errors: ' + errorCount);
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


function clearInputFields() {
  $('#addRecipe fieldset p#ingredientList').html('');
  $('#addRecipe fieldset input#inputRecipeName').val('');
}


function addNewRecipe(recipe) {
  $.ajax({
    type: 'POST',
    data: {recipe: JSON.stringify(recipe)},
    url: '/recipes/addrecipe',
    dataType: 'JSON'
  }).done(function(response) {
    if (response.msg === '') {
      clearInputFields();
      populateTable();
    }
    else {
      alert('Error: ' + response.msg);
    }
  });
}

function saveEditedRecipe(recipe) {
  $.ajax({
    type: 'PUT',
    data: {recipe: JSON.stringify(recipe)},
    url: '/recipes/editrecipe/' + editRecipeId,
    dataType: 'JSON'
  }).done(function(response) {
    if (response.msg === '') {
      clearInputFields();
      populateTable();
      editRecipeId = undefined;
    }
    else {
      alert("Error: " + response.msg);
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


function createIngredientHtmlSelect(id, name, value, values)
{
  // <label for="' + name + 's">Choose a value:</label>
  var select = '<select name="' + name + '" id='+id+'>';
  for (const v of values) {
    selected = v == value ? " selected" : "";
    select += '<option value="' + v + '"' +  selected + '>' + v + '</option>';
  }
  select += '</select>'
  return select
}


function createIngredientHtmlRow(amount, unit, name, specification) {
  var row = '<span id="ingredient">';
  row += createIngredientHtmlField('inputIngredientAmount', 5, 'Amount', amount);
  row += createIngredientHtmlSelect('inputIngredientUnit', 'Unit', unit, available_units);
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


function prepareRecipeEdit(event) {
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

  console.log("TODO: Commented out verification. Restore and fix.");
  if (!verifyInputFields()) {
    return;
  }

  var recipe = getRecipeFromInputFields();

  if (editRecipeId === undefined) {
    addNewRecipe(recipe);
  }
  else {
    saveEditedRecipe(recipe);
  }
}
