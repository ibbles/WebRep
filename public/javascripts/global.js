// Userlist data array for filling in info box
var userListData = [];
console.log("Parsing global.js");

// DOM Ready =============================================================
$(document).ready(function() {
  // Populate the user table on initial page load
  populateTable();

  $('#userList table tbody').on('click', 'td a.linshowuser', showUserInfo);
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
      tableContent += '</tr>';
    });

    // Inject the whole content string into our existing HTML table
    $('#userList table tbody').html(tableContent);
  });
};

function showUserInfo(event) {
  event.preventDefault();

  var thisUserName = $(this).attr('rel');
  var index = userListData.map(function(arrayItem) {return arrayItem.username;}).indexOf(thisUserName);
  var thisUserObject = userListData[index];
  $('#userInfoName').text(thisUserObject.fullname);
  $('#userInfoAge').text(thisUserObject.age);
  $('#userInfoGender').text(thisUserObject.gender);
  $('#userInfoLocation').text(thisUserObject.location);
};