//  OpenShift sample Node application
var face = require('os');

var alert = require('alert-node');
var log4js = require('log4js');
log4js.configure({
    "appenders": {
      "access": {
        "type": "dateFile",
        "filename": "log/access.log",
        "pattern": "-yyyy-MM-dd",
        "category": "http"
      },
      "app": {
        "type": "file",
        "filename": "log/app.log",
        "maxLogSize": 10485760,
        "numBackups": 3
      },
      "errorFile": {
        "type": "file",
        "filename": "log/errors.log"
      },
      "errors": {
        "type": "logLevelFilter",
        "level": "ERROR",
        "appender": "errorFile"
      }
    },
    "categories": {
      "default": { "appenders": [ "app", "errors" ], "level": "DEBUG" },
      "http": { "appenders": [ "access"], "level": "DEBUG" }
    }
  });
console.log("hi.....")
console.log("ip================="+face.address);
console.log("hi........ 1234567890.....1.....");

console.log("hi........ 1234567890..........");
console.log("hi........ 1234567890..........");
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'),
    //rabbit  = require('./rabbit/connectRabbit');
    
//Object.assign=require('object-assign')

//app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

////////////////////////////////////////////////////////////////////////////////////////////

//code for rabbitmq




////////////////////////////////////////////////////////////////////////////////////////////



var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

console.log("port========================================"+port);
console.log("IP========================================"+ip);
console.log("mongoURL========================================"+mongoURL);
//mongoURL = "mongodb://user:password@localhost:27017/guestbook";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
    console.log("when mongourl is null");
    console.log(process.env.DATABASE_SERVICE_NAME);
  if (process.env.DATABASE_SERVICE_NAME) {
    console.log(process.env.DATABASE_SERVICE_NAME);
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'].replace("@","%40");
    mongoUser = process.env[mongoServiceName + '_USER'];
      
      console.log("when mongourl is null===============2");

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    console.log("database_name======================"+process.env.database_name)
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
      console.log("when mongourl is null===============3");
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
        console.log("when mongourl is null=============4");
      if (mongoUriParts && mongoUriParts.length == 2) {
          console.log("when mongourl is null===========5");
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
      
      console.log("when mongourl is not null==================1");
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
        console.log("when mongourl is not null==================2");
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
      console.log("when mongourl is not null==================3");
      console.log("mongoURLLabel=============================="+mongoURLLabel)
      
  }
}
var db = null,
    dbDetails = new Object();
console.log("db details==================1");
var initDb = function(callback) {
  if (mongoURL == null) return;
    console.log("db details==================2"+mongoURL);
  var mongodb = require('mongodb');
  if (mongodb == null) return;
    console.log("db details==================3");
  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    if(db){
    
        console.log("db object exists  "+db.databaseName);
    }
    else{
        console.log("db object not exists  ");
    }

    dbDetails.databaseName = db.databaseName;
    console.log("db details ======================="+dbDetails.databaseName);
    console.log("mongoURLLabel========================"+mongoURLLabel);
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
    console.log("Connected to MongoDB at:"+mongoURL);
    
      
    var col = db.collection('counts');
      console.log("counts======================"+col);
      console.log("db details==================4");
      console.log("ip=========================="+ip);
      
    // Create a document with request IP and current time of request
    col.insert({ip: ip, date: Date.now()});
      console.log("db details==================5");
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
        console.log("error-----------------1");
          console.log('Error running count. Message:\n'+err);  
          
      }
      console.log("count==========================="+count);
    });
    
  });
  if(db){
    
    console.log("db object exists ===============2 "+db.databaseName);
  }
  else{
    console.log("db object not exists ===========2 ");
  }
  
 
};
if(db){
    
    console.log("db object exists  "+db.databaseName);
}
else{
    console.log("db object not exists  ");
}
app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  console.log("inside app get ============================"+req);
  if (!db) {
    initDb(function(err){console.log("app get error==========================");});
  }
  if (db) {
    var col = db.collection('counts');
      console.log("counts======================"+col);
      console.log("db details==================6");
      console.log("ip=========================="+req.ip);
      
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
      console.log("db details==================7");
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
        console.log("error-----------------1");
          console.log('Error running count. Message:\n'+err);  
          
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
        console.log("db details==================8");
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
      console.log("db details==================9");
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  console.log("error-----------------2");
  console.log(err.stack);  
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
    console.log("error-----------------3");
  console.log('Error connecting to Mongo. Message:\n'+err);  
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
console.log("The End");
console.log("Server running on http://"+ip+port);
console.log("The End");
module.exports = app ;
