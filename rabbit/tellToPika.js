const amqp = require('../node_modules/amqplib/callback_api');
//console.log("------------------------------"+process.env.CLOUDAMQP_URI+"-----------------------");
var amqpConn = null;
var queue_name = "";
var messages = "";
var ch = null;
var offlinePubQueue = [];


function whenConnected(queue_name,messagestr, amqpConn) {
  if(amqpConn){
    startPublisher(queue_name,messagestr, amqpConn);
  }
}
function startPublisher(queue_name,messagestr,amqpConn){

  amqpConn.createChannel(function(error1, channel) {

      let queue = queue_name; //'callAPIRequest';
      let msg   = messagestr;//'start_calling_api';

      channel.assertQueue(queue, {
        durable: true
      });
      if (closeOnErr(error1)) return;
      channel.on("error", function(error1) {
        console.error("[AMQP] channel error", error1.message);
      });
      channel.on("close", function() {
        console.log("[AMQP] channel closed");
      });

      ch = channel;
      while (true) {
        //offlinePubQueue.push(["", queue_name, new Buffer(messagestr)]);
        var [exchange, routingKey, content] = offlinePubQueue.shift();
        publish(exchange, routingKey, content);
      }
  });
  setTimeout(function() {
      amqpConn.close();
      process.exit(0)
    }, 500);  
}
function publish(exchange, routingKey, content) {
  try {
    
    ch.publish(exchange, routingKey, content, { persistent: true },
                      function(err, ok) {
                        if (err) {
                          console.error("[AMQP] publish", err);
                          offlinePubQueue.push([exchange, routingKey, content]);
                          pubChannel.connection.close();
                        }
                      });
  } catch (e) {
    console.error("[AMQP] publish", e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
}

function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    amqpConn.close();
    return true;
}

function start() {
    console.log("inside start tellToPika"+queue_name+messagestr)
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
      whenConnected(queue_name,messagestr, amqpConn);
    });
}


var tellToPika = {  
  run: function(queue, msgstr) {
    queue_name = queue;
    messagestr = msgstr;
    setInterval(function(queue_name, messagestr) {
      publish("", queue_name, new Buffer(messagestr));
    }, 1000);
    start();  
  },
  stop:function() {
    if(amqpConn){
      amqpConn.close();
      return true;
    }
  }
}


module.exports = tellToPika;
//module.exports.start = start
//module.exports.stop = stop
