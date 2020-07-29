const amqp = require('../node_modules/amqplib/callback_api');
var fs     = require('fs');
//console.log("------------------------------"+process.env.CLOUDAMQP_URI+"-----------------------");
var amqpConn = null;
var queue_name = '';
var messagestr = '';
var ch = null;
function whenConnected(queue_name,messagestr,amqpConn) {
  startConsumer(queue_name,messagestr,amqpConn);
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}
function processMsg(msg) {
  work(msg, function(ok) {
    try {
      if (ok)
        ch.ack(msg);
      else
        ch.reject(msg, true);
    } catch (e) {
      closeOnErr(e);
    }
  });
}
function work(msg, cb) {
  console.log("PDF processing of ", msg.content.toString());
  console.log(process.env.OLDPWD);
  const path = process.env.OLDPWD;
  console.log(process.env.OLDPWD);
  const filepath = path.concat("/data/11001101");
  fs.writeFile(filepath, msg, function (err) {
    if (err) throw err;               
    console.log('Results Received');
  });
  cb(true);
}
function startConsumer(queue_name,messagestr,amqpConn){

  amqpConn.createChannel(function(error1, channel) {

      let queue = queue_name; //'receiveAPIResponse'; //'callAPIRequest';
      let msg   = messagestr;//'start_calling_api';

      if (closeOnErr(error1)) return;
      channel.on("error1", function(error1) {
        console.error("[AMQP] channel error1", err.message);
      });
      channel.on("close", function() {
        console.log("[AMQP] channel closed");
      });

      channel.prefetch(10);
      channel.assertQueue(queue_name, { durable: true }, function(err, _ok) {
        if (closeOnErr(err)) return;
        console.log("channel----------------------------"+channel);
        ch = channel;
        channel.consume(queue_name, processMsg, { noAck: false });
        console.log("consumer is started");
      });
  });

}

function start() {
  amqp.connect(process.env.CLOUDAMQP_URI, function(err, connection) {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }
    connection.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    connection.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });
    console.log("[AMQP] connected");
    amqpConn = connection;
    whenConnected(queue_name,messagestr,amqpConn);
  });

  
}
var listenToPika = {
run: function(queuename, message) {
     queue_name = queuename;
     messagestr = message;
     console.log(queue_name);
     console.log(messagestr);
     start();
},


stop:function() {
  if(amqpConn){
    amqpConn.close();
    return true;
  }
}
  
}

//listenToPika.run('consumeAPIResponse', 'receiveAPIResponse');

module.exports = listenToPika;

//module.exports.start = start;
//module.exports.stop = stop;
