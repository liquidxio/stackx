#liquidIO is a polling program which uses with Node.js, Express, and MongoDB


## Quickstart




## Author




## Contents



WELCOME TO THE STACKOVERFLOW PROGRAM

This program allows a user to search for a user by means of a username or an ID. Ahead is info pertaining to the 
2 different search methods.

##Pre-info:  head to http://www.stackoverflow.com/users to see a list of every user on stack overflow
## Only search by one field at a time.  If both the username and ID field have input in them, you will
## be asked to search again using only one method.

#npm modules
do an 'npm install http' if you do not already have this package

#Search with username text box
The username search method will pull every search result that is similar to the name. 
For example:  A search for 'Jon' will return every person that has jon in their name.
If the username is specific, like 'commonsware', or like 'jon skeet', then the exact user will be returned.
However, if the username is 'leo', multiple users will be returned.  Only the first user returned will be presented
to the program, yet all will be insterted into mongodb (Can't figure out why exactly).  

For instances when a users name is ubiquitous, a search by the id field is preferred.

#Serach by ID
The search by ID method will return the exact user that matches the ID field.
To get a users ID, go to the website that shows all users for stackoverflow (mentioned above) and 
click on a user.  Once at the users profile page, their ID can be extracted from the url.
Example: 
	http://stackoverflow.com/users/1032492/leo
the ID that needs to be extracted is  '1032492'.



