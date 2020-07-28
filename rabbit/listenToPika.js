const amqp = require('../node_modules/amqplib/callback_api');
var fs     = require('fs');
//console.log("------------------------------"+process.env.CLOUDAMQP_URI+"-----------------------");
var amqpConn = null;
var queue_name = '';
var messagestr = '';

function whenConnected(queue_name,messagestr,amqpConn) {
  startConsumer(queue_name,messagestr,amqpConn);
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}


function startConsumer(queue_name,messagestr,amqpConn){

  amqpConn.createChannel(function(error1, channel) {

      let queue = queue_name; //'receiveAPIResponse'; //'callAPIRequest';
      let msg   = messagestr;//'start_calling_api';

      channel.assertQueue(queue, {
        durable: true
      });
      if (closeOnErr(error1)) return;

      channel.consume(queue, Buffer.from(msg), {
        persistent: true
      });
      console.log("Sent '%s'", msg);
      var path = process.env.OLDPWD+'/data/11001101';
      fs.writeFile(path, msg, function (err) {
        if (err) throw err;               
        console.log('Results Received');
      }); 
    });
    setTimeout(function() {
      amqpConn.close();
      process.exit(0)
    }, 500);  

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
