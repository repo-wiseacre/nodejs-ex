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
alert("hi.....")
alert("ip================="+face.address);
alert("hi........ 1234567890.....1.....");

console.log("hi........ 1234567890..........");
alert("hi........ 1234567890..........");
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'),
    rabbit  = require('./rabbit/connectRabbit');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

////////////////////////////////////////////////////////////////////////////////////////////

//code for rabbitmq




////////////////////////////////////////////////////////////////////////////////////////////



var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

alert("port========================================"+port);
alert("IP========================================"+ip);
alert("mongoURL========================================"+mongoURL);
//mongoURL = "mongodb://user:password@localhost:27017/guestbook";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
    alert("when mongourl is null");
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'].replace("@","%40");
    mongoUser = process.env[mongoServiceName + '_USER'];
      
      alert("when mongourl is null===============2");

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    alert("database_name======================"+process.env.database_name)
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
      alert("when mongourl is null===============3");
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
        alert("when mongourl is null=============4");
      if (mongoUriParts && mongoUriParts.length == 2) {
          alert("when mongourl is null===========5");
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
      
      alert("when mongourl is not null==================1");
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
        alert("when mongourl is not null==================2");
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
      alert("when mongourl is not null==================3");
      alert("mongoURLLabel=============================="+mongoURLLabel)
      
  }
}
var db = null,
    dbDetails = new Object();
alert("db details==================1");
var initDb = function(callback) {
  if (mongoURL == null) return;
    alert("db details==================2"+mongoURL);
  var mongodb = require('mongodb');
  if (mongodb == null) return;
    alert("db details==================3");
  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    if(db){
    
        alert("db object exists  "+db.databaseName);
    }
    else{
        alert("db object not exists  ");
    }

    dbDetails.databaseName = db.databaseName;
    alert("db details ======================="+dbDetails.databaseName);
    alert("mongoURLLabel========================"+mongoURLLabel);
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
    alert("Connected to MongoDB at:"+mongoURL);
    
      
    var col = db.collection('counts');
      alert("counts======================"+col);
      alert("db details==================4");
      alert("ip=========================="+ip);
      
    // Create a document with request IP and current time of request
    col.insert({ip: ip, date: Date.now()});
      alert("db details==================5");
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
        alert("error-----------------1");
          alert('Error running count. Message:\n'+err);  
          
      }
      alert("count==========================="+count);
    });
    
  });
  if(db){
    
    alert("db object exists ===============2 "+db.databaseName);
  }
  else{
    alert("db object not exists ===========2 ");
  }
  
 
};
if(db){
    
    alert("db object exists  "+db.databaseName);
}
else{
    alert("db object not exists  ");
}
app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  alert("inside app get ============================"+req);
  if (!db) {
    initDb(function(err){alert("app get error==========================");});
  }
  if (db) {
    var col = db.collection('counts');
      alert("counts======================"+col);
      alert("db details==================6");
      alert("ip=========================="+req.ip);
      
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
      alert("db details==================7");
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
        alert("error-----------------1");
          alert('Error running count. Message:\n'+err);  
          
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
        alert("db details==================8");
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
      alert("db details==================9");
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
  alert("error-----------------2");
  alert(err.stack);  
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
    alert("error-----------------3");
  alert('Error connecting to Mongo. Message:\n'+err);  
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
alert("The End");
alert("Server running on http://"+ip+port);
alert("The End");
module.exports = app ;
