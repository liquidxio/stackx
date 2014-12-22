var express = require('express');
var router = express.Router();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// npm install http -> used to make http call to api 
var http = require("http");
// zlib is included in javascript libraries, used to decompress gzip object from api
var zlib = require("zlib");
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//==========================Variables for Software Repository Polling =============================
//github Node NPM module
//
var github = require('octonode');

//set up variable to pass as a parameter for git hub
var client = github.client();

//web app environment- 

var qs = require('querystring');

// ================================================================================================


/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    var db = req.db;
    db.collection('userlist').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    var parmAdd = req.body;
    var parmAdd1 = JSON.stringify(parmAdd);
    console.log('parmAdd = ' + parmAdd1);   

    //pulse the repository with parameter -- and display json object on the console.
    var pulseParm = '/users/' + parmAdd.username;
    console.log('pulseParm = ' + pulseParm);
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Code to retrieve user JSON from stackoverflow
    
    // username from web page text box
    var stackName = parmAdd.username;
    
    // API url to search by username - using this one
    var url = "http://api.stackexchange.com/2.2/users?order=desc&sort=reputation&inname=" + stackName + "&site=stackoverflow";

    //====================For Future (Not used yet)====================================
    var id = parmAdd.ID;
    // API url to search by id -- Not used yet    
    var url2 = 'http://api.stackexchange.com/2.2/users/' + id + '?order=desc&sort=reputation&site=stackoverflow';
    //=================================================================================
    
    var jdata,
    	jTagData,
    	urlTag,
    	userTags = '';
    
    function getGzipped(url, callback) {
        // buffer to store the streamed decompression
        var buffer = [];

        http.get(url, function(resp) {
            // pipe the response into the gunzip to decompress
            var gunzip = zlib.createGunzip();            
            resp.pipe(gunzip);

            gunzip.on('data', function(data) {
                // decompression chunk ready, add it to the buffer
                buffer.push(data.toString())

            }).on("end", function() {
                // response and decompression complete, join the buffer and return
                callback(null, buffer.join("")); 

            }).on("error", function(e) {
                callback(e);
            })
        }).on('error', function(e) {
            callback(e)
        });
    }
        
    function runDateSwitch(weekDay) {
        var day;

        switch (weekDay) {
            case 0: day = "Sun";
                break; 
            case 1: day = "Mon";
                break;
            case 2: day = "Tues";
                break;            
            case 3: day = "Wed";
                break;
            case 4: day = "Thurs";
                break;
            case 5: day = "Fri";
                break;
            case 6: day = "Sat";
        }
        
        return day;
    }
    
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    if(parmAdd.username != '' && parmAdd.ID === '') {
	    getGzipped(url, function(err, data) {    	   
	    	
	    	   jdata = JSON.parse(data);   	   
	    	   
	    	   
	    	   if (jdata.items.length === 0){
	    		   res.send({ msg: "Outcomes Not Found" });
	    		   console.log("No user matches that name!");
	    	   } 
	    	   else {    		   
	    	   
		    	   // Add source to object
		    	   jdata.source = "stackoverflow";	    	   
		    	   
		    	   // Change times from unix epoch time to human readable time
		    	   var myDate = new Date( jdata.items[0].last_modified_date * 1000);
		           jdata.items[0].last_modified_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));
		    	   
		           myDate = new Date( jdata.items[0].last_access_date * 1000);
		           jdata.items[0].last_access_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));
		           
		           myDate = new Date( jdata.items[0].creation_date * 1000);
		           jdata.items[0].creation_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));          
		           
		           
		           
		           // Add commas to reputation value to make it more human readable
		           jdata.items[0].reputation = numberWithCommas(jdata.items[0].reputation); 
		           
		           
		           // API for users Tags using user id
		           urlTag = 'http://api.stackexchange.com/2.2/users/' + jdata.items[0].user_id + '/tags?order=desc&sort=popular&site=stackoverflow'; 
		           	           
		           /** Run another API call using users id to get tags **/
		           getGzipped(urlTag, function(errT, dataT) {
		        	   
			           	jTagData = JSON.parse(dataT);           	
			           	
			           	for(var i = 0; i < jTagData.items.length; i++) {
			           	        
			           		userTags += jTagData.items[i].name + " ";
			           	}    	 
		           	
			            jdata.tags = userTags;			           
				           
				        console.log(jdata);		           	
			           	
		     		    //Record JSON object retrieved from repository on MongoDB
		                db.collection('userlist').insert(jdata, function(err, result) {
		                        res.send((err === null) ? { msg: '' } : { msg: err });
		                });	     	   
			           	
		           });  
	    	   }  	   
	    });
    }
    else if (parmAdd.ID != '' && parmAdd.username === '') {
    	getGzipped(url2, function(err, data) {    	   
	    	
	    	   jdata = JSON.parse(data);   	   
	    	   
	    	   
	    	   if (jdata.items.length === 0){
	    		   res.send({ msg: "Outcomes Not Found" });
	    		   console.log("No user matches that name!");
	    	   } 
	    	   else {    		   
	    	   
		    	   // Add source to object
		    	   jdata.source = "stackoverflow";	    	   
		    	   
		    	   // Change times from unix epoch time to human readable time
		    	   var myDate = new Date( jdata.items[0].last_modified_date * 1000);
		           jdata.items[0].last_modified_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));
		    	   
		           myDate = new Date( jdata.items[0].last_access_date * 1000);
		           jdata.items[0].last_access_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));
		           
		           myDate = new Date( jdata.items[0].creation_date * 1000);
		           jdata.items[0].creation_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));          
		           
		           
		           
		           // Add commas to reputation value to make it more human readable
		           jdata.items[0].reputation = numberWithCommas(jdata.items[0].reputation); 
		           
		           
		           // API for users Tags using user id
		           urlTag = 'http://api.stackexchange.com/2.2/users/' + jdata.items[0].user_id + '/tags?order=desc&sort=popular&site=stackoverflow'; 
		           	           
		           /** Run another API call using users id to get tags **/
		           getGzipped(urlTag, function(errT, dataT) {
		        	   
			           	jTagData = JSON.parse(dataT);           	
			           	
			           	for(var i = 0; i < jTagData.items.length; i++) {
			           	        
			           		userTags += jTagData.items[i].name + " ";
			           	}    	 
		           	
			            jdata.tags = userTags;			           
				           
				        console.log(jdata);		           	
			           	
		     		    //Record JSON object retrieved from repository on MongoDB
		                db.collection('userlist').insert(jdata, function(err, result) {
		                        res.send((err === null) ? { msg: '' } : { msg: err });
		                });	     	   
			           	
		           });  
	    	   }  	   
	    });
    }
    else if (parmAdd.username != '' && parmAdd.ID != '') {
    	res.send({ msg: "Search by only one field" });
    }
});

/*
 * DELETE to deleteuser.
 */

router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('userlist').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;