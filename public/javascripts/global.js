// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {
  // Populate the user table on initial page load
  populateTable();

  $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
  $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
  $('#userList table tbody').on('click', 'td a.linkedituser', editUser);
  $('#btnAddUser').on('click', addUser);
  $('#btnSaveUser').on('click', saveUser);
});

// Functions =============================================================

// Fill table with data
function populateTable() {

  // Empty content string
  var tableContent = '';

  // jQuery AJAX call for JSON
  $.getJSON( '/users/userlist', function( data ) {
    userListData = data;

    // For each item in our JSON, add a table row and cells to the content string
    $.each(data, function(){
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.username + '</a></td>';
      tableContent += '<td>' + this.email + '</td>';
      tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
      tableContent += '<td><a href="#" class="linkedituser" rel="' + this.username + '">edit</a></td>';
      tableContent += '</tr>';
    });

    // Inject the whole content string into our existing HTML table
    $('#userList table tbody').html(tableContent);
  });
};


function getUserObject(self) {
  var thisUserName = $(self).attr('rel');
  var index = userListData.map(function(arrayItem) { return arrayItem.username;}).indexOf(thisUserName);
  return userListData[index];
}


function showUserInfo(event) {
  event.preventDefault();

  var thisUserObject = getUserObject(this);
  $('#userInfoName').text(thisUserObject.fullname);
  $('#userInfoAge').text(thisUserObject.age);
  $('#userInfoGender').text(thisUserObject.gender);
  $('#userInfoLocation').text(thisUserObject.location);
};


function addUser(event) {
  event.preventDefault();

  var haveChecked = false;
  var errorCount = 0;
  $('#addUser input').each(function(index, val) {
    haveChecked = true;
    if ($(this).val() === '') {
      errorCount++;
    }
  });

  if (!haveChecked) {
    alert('Error: Did not do any verification.');
  }

  if (errorCount === 0) {
    var newUser = {
      'username': $('#addUser fieldset input#inputUserName').val(),
      'email': $('#addUser fieldset input#inputUserEmail').val(),
      'fullname': $('#addUser fieldset input#inputUserFullname').val(),
      'age': $('#addUser fieldset input#inputUserAge').val(),
      'location': $('#addUser fieldset input#inputUserLocation').val(),
      'gender': $('#addUser fieldset input#inputUserGender').val()
    };

    $.ajax({
      type: 'POST',
      data: newUser,
      url: '/users/adduser',
      dataType: 'JSON'
    }).done(function(response) {
      if (response.msg === '') {
        $('#addUser fieldset input').val('');
        populateTable();
      }
      else {
        alert('Error: ' + response.msg);
      }
    });
  }
  else {
    alert('Please fill in all fields.');
    return false;
  }
}


function deleteUser(event) {
  event.preventDefault();

  var confirmation = confirm('Are your sure?');
  if (confirmation === true) {
    $.ajax({
      type: 'DELETE',
      url: '/users/deleteuser/' + $(this).attr('rel')
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


function editUser(event) {
  event.preventDefault();

  var thisUserObject = getUserObject(this);
  $('#addUser fieldset input#inputUserName').val(thisUserObject.username);
  $('#addUser fieldset input#inputUserEmail').val(thisUserObject.email);
  $('#addUser fieldset input#inputUserFullname').val(thisUserObject.fullname);
  $('#addUser fieldset input#inputUserAge').val(thisUserObject.age);
  $('#addUser fieldset input#inputUserLocation').val(thisUserObject.location);
  $('#addUser fieldset input#inputUserGender').val(thisUserObject.gender);
}


function saveUser(event) {
  event.preventDefault();
  alert("Saving a user");

}