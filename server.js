//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    morgan  = require('morgan');
 //var sw     = require('../src/js/sw.js');
var   tell      = require('../src/rabbit/tellToPika'),
      listen    = require('../src/rabbit/listenToPika');
//const css = require('../src/views/css/piechart.css');
const data = require('../src/manifest.json');
const {spawn} = require('child_process');

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'].replace("@","%40");
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/covid', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
        var http = require('http');	

        //The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'	
      var options = {	
        host: 'http://nodejs-mongo-persistent-cloud4.apps.us-east-1.starter.openshift-online.com',
        //port: '80',
        path: '../console'
      };	

      callback = function(response) {	
        var str = '';	

        //another chunk of data has been received, so append it to `str`	
        response.on('data', function (chunk) {	
          str += chunk;	
        });	

        //the whole response has been received, so we just print it out here	
        response.on('end', function () {	
          console.log(str);	
        });	
      }	

      //http.request(options, callback).end();
      
        const listenToPikaService = spawn('node', ['-e','require("../src/rabbit/listenToPika.js").run("consumeAPIResponse","consumeResponse")'], {
            detach: true,
            stdio:  'ignore'

        });
        listenToPikaService.unref();
        console.log("listenToPika service");
        
        const tellToPikaService = spawn('node', ['-e','require("../src/rabbit/tellToPika").start("callAPIRequest","callAPI")'], {
            detach: true,
            stdio:  'ignore'

        });
        tellToPikaService.unref();

        console.log("tellToPika service");
        
        
      //http.get(options, function(resp){
      //    resp.on('data', function(chunk){
      //      //do something with chunk
      //    });
      //  }).on("error", function(e){
      //    console.log("Got error: " + e.message);
      //  });  
        
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
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
    
    tell.stop();
    listen.stop();
  } else {
    res.send('{ pageCount: -1 }');
  }
});


app.get('/manifest.webmanifest', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  res.json(data);
});

app.get('/sw.js', function (req, res) {
    fs.readFile('../src/js/sw.js', function(err, data) {
        if (err){
            throw err;
        }
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(data);
    });
});

app.get('/images/manifest.png', function (req, res) {
    fs.readFile('../src/png/manifest.png', function(err, data) {
        if (err){
            throw err;
        }
        res.writeHead(200, { 'Content-Type': 'image/svg' });
        res.end(data);
    });
});

//01110010 01100001 01100010 01100010 01101001 01110100 

app.get('/console', function (req, res) {
    //var id = req.query.id;
    //if(id=='011100100110000101100010011000100110100101110100'){
          //render html console for rabbit queue check 
      //await tell.start('callAPIRequest','call api request');
      //console.log("await for callAPI")
      //await listen.start('publishAPIResponse', 'publishAPIResponse');
      //res.statusCode = 200;
      //res.data = {"message-sent":true};
      //next();
    
    const tellToPikaService = spawn('node', ['-e','require("../src/rabbit/tellToPika").start("callAPIRequest","callAPI")'], {
        detach: true,
        stdio:  'ignore'
        
    });
    tellToPikaService.unref();
    
    console.log("tellToPika service");
    const listenToPikaService = spawn('node', ['-e','require("../src/rabbit/listenToPika").start("consumeAPIResponse","consumeResponse")'], {
        detach: true,
        stdio:  'ignore'
        
    });
    listenToPikaService.unref();
    console.log("listenToPika service");
    res.statusCode = 200;
    res.data = {"message-sent":true};
    res.end(); 
    //next();
      //tell.start('callAPIRequest','call api request');
      //listen.start('publishAPIResponse', 'publishAPIResponse');
      
    //}
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
