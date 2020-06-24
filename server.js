const express = require('express');
var path = require('path');
//import express from 'express';  // ES6
const app = express();

// $PORT env var if available or fallback to default (per heroku)
const port = process.env.PORT || 1234;

//app.use('/node_modules', express.static('node_modules'));
//app.use('/app', express.static('public'));


// logging

app.use(function (req, res, next) {
    var filename = path.basename(req.url);
    var extension = path.extname(filename);
    //if (extension === '.css')
    console.log("The file " + filename + " was requested.");
    next();
});

// els statics que es demanen per arrel s'envien des de app
//app.use('/', express.static('app'));   
app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/app/css'));
app.use(express.static(__dirname + '/src'));   // per debug

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, './app/', 'default.html'));
    //console.log("received from "+req.get("X-Forwarded-For")+" : "+req.method+" "+req.originalUrl);
    console.log("Enviat default.html");
      //does not work if json is malformed

});



app.listen(port,
     () => console.log(`Express server running at http://127.0.0.1:${port}`));