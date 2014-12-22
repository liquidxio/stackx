// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();

    // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Add User button click
    $('#btnAddUser').on('click', addUser);    

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

});

// Functions =============================================================

// Fill table with data
function populateTable() {
	
	
    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {

        // Populate the global variable userListData with the data retrieved from MongoDB
        userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.items[0].display_name + '" title="Show Details">' + this.items[0].display_name + '</a></td>';
            tableContent += '<td>' + this.items[0].accept_rate + '</td>';
            tableContent += '<td><img class= "input-img" src= "' + this.items[0].profile_image + '" style= "width:50px;height:50px"></img></td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });
        
        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
        
        
    });
    
};

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on username value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.items[0].display_name; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];    
    
    $('#userInfoName').text('');
    $('#gold').text('');
    $('#silver').text('');
    $('#bronze').text('');
    $('#display_name').text('');
    $('#account_id').text('');
    $('#is_employee').text('');
    $('#last_modified').text('');
    $('#last_access').text('');
    $('#reputation_year').text('');
    $('#reputation_quarter').text('');
    $('#reputation_month').text('');
    $('#reputation_week').text('');
    $('#reputation_day').text('');
    $('#reputation').text('');
    $('#creation_date').text('');
    $('#user_type').text('');
    $('#user_id').text('');
    $('#accept_rate').text('');
    $('#location').text('');
    $('#website').text('');
    $('#link').text('');
    $('#quota_remaining').text('');
    $('#pic_name').text('');
    $('#age').text('');
    $('#tags').text('');
    
    //Populate Info Box
    $('#userInfoName').text(thisUserObject.items[0].display_name);
    $('#gold').text(thisUserObject.items[0].badge_counts.gold);
    $('#silver').text(thisUserObject.items[0].badge_counts.silver);
    $('#bronze').text(thisUserObject.items[0].badge_counts.bronze);
    $('#display_name').text(thisUserObject.items[0].display_name);
    $('#account_id').text(thisUserObject.items[0].account_id);
    $('#is_employee').text(thisUserObject.items[0].is_employee);
    $('#last_modified').text(thisUserObject.items[0].last_modified_date);
    $('#last_access').text(thisUserObject.items[0].last_access_date);
    $('#reputation_year').text(thisUserObject.items[0].reputation_change_year);
    $('#reputation_quarter').text(thisUserObject.items[0].reputation_change_quarter);
    $('#reputation_month').text(thisUserObject.items[0].reputation_change_month);
    $('#reputation_week').text(thisUserObject.items[0].reputation_change_week);
    $('#reputation_day').text(thisUserObject.items[0].reputation_change_day);
    $('#reputation').text(thisUserObject.items[0].reputation);
    $('#creation_date').text(thisUserObject.items[0].creation_date);
    $('#user_type').text(thisUserObject.items[0].user_type);
    $('#user_id').text(thisUserObject.items[0].user_id);
    $('#accept_rate').text(thisUserObject.items[0].accept_rate);
    $('#location').text(thisUserObject.items[0].location);
    $('#website').text(thisUserObject.items[0].website_url);
    $('#link').text(thisUserObject.items[0].link);
    $('#quota_max').text(thisUserObject.quota_max);
    $('#quota_remaining').text(thisUserObject.quota_remaining);
    $('#pic').attr("src", thisUserObject.items[0].profile_image);
    $('#pic_name').text(thisUserObject.items[0].display_name);
    $('#age').text(thisUserObject.items[0].age);
    
    
    $('#tags').text(thisUserObject.tags);
    
   
};

// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser fieldset #inputUserName').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });
    $('#addUser fieldset #inputUserID').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });   
    
    // Check and make sure errorCount's still at zero or 1
    if(errorCount === 0 || errorCount === 1) {

        // If it is, compile search parameters into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'ID': $('#addUser fieldset input#inputUserID').val()
        }
        
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();     
               
            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

                $('#addUser fieldset input').val('');
            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please specify a username or ID to look up');
        return false;
    }
};

// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();
            //location.reload();
        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};