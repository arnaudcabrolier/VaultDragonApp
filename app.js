'use strict';

var path = require('path');
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();

// Enable body parser to parse url
app.use(bodyParser.urlencoded({ extended: true })); 


// Google CloudSQL Database connection
function connectDatabase(){ 
	   var connection = mysql.createConnection({
        user: 'nodejsapp',
        password: 'iut-21002420',
        host: '173.194.248.180',
        database: 'library'
    });  
	return connection;
}


// POST url : /object
// return : value
// Feature : key/value/timestamp storage

app.post('/object', function(req, res) {
  
    var connection = connectDatabase();
	// First check if the entry is existing in DB, based on its unique key
	connection.query('SELECT * FROM objects WHERE mykey = ?', [req.body.key], function(err, results) {
		if (results[0]) {
			// If the key is already in DB, update its associated value
			if (results[0].myvalue!=req.body.value && results[0].mykey==req.body.key ) {
				connection.query('UPDATE objects SET myvalue = ? WHERE mykey = ?', [req.body.value, req.body.key]);
				res.send('' + "Updated entry"); //print value
			} 
		} 
		else { // New entry requires to be stored in DB
			connection.query('insert into objects (id, mykey, myvalue, myts) values ("","' + req.body.key + '", "' + req.body.value + '","' + new Date().getTime() + '")');
			res.send('' + "Saved"); //print value
			}
	});
});



// GET url : object/key
// return : value
// Feature : Get the value from a key

app.get('/object/:key', function(req, res) {    
   
  var connection = connectDatabase();
  //SELECT the entry that matches the key
  connection.query('SELECT * FROM objects WHERE mykey = ?', [req.params.key], function(err, results) {
	if (results[0]) {
				if (results[0].mykey=req.params.key ) {
					res.send('' + results[0].myvalue); //print value
				} 
			} 
    });
});
 

 
// GET url : object/key/timestamp
// return : value
// Feature : Get the value of a specific key and timestamp

app.get('/object/:key/:ts', function(req, res) {  
  
 var connection = connectDatabase();
 // SELECT the matching entry on key AND timestamp
 connection.query('SELECT * FROM objects WHERE mykey = ? AND myts = ?', [req.params.key, req.params.ts], function(err, results) {
	if (results[0]) {
				if (results[0].mykey==req.params.key && results[0].myts==req.params.ts) {
					res.send('' + results[0].myvalue); //print the value
				} 
			} else { // if the couple key/timestamp is invalid
				res.send('' + "No entry matching");
			}
    });
});
 

 

// Basic 404 handler
app.use(function (req, res) {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use(function (err, req, res, next) {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  // Start the server
  var server = app.listen(8080, function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
}

module.exports = app;
