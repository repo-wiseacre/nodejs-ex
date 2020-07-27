const amqp = require('../node_modules/amqplib/callback_api');
var fs     = require('fs');
//console.log("------------------------------"+process.env.CLOUDAMQP_URI+"-----------------------");
var amqpConn = null;
var listenToPika = {
start:function(queue_name, messagestr,amqpConn) {
  amqp.connect(process.env.CLOUDAMQP_URI, function(err, connection) {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });
    console.log("[AMQP] connected");
    amqpConn = connection;
    whenConnected(queue_name,messagestr,amqpConn);
  });

  
},

whenConnected: function(queue_name,messagestr,amqpConn) {
  startConsumer(queue_name,messagestr,amqpConn);
},

startConsumer: function(queue_name,messagestr,amqpConn){

  connection.createChannel(function(error1, channel) {

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
      fs.writeFile('../data/11001101', msg, function (err) {
        if (err) throw err;               console.log('Results Received');
      }); 
    });
    setTimeout(function() {
      amqpConn.close();
      process.exit(0)
    }, 500);  

},

closeOnErr: function(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
},


stop:function() {
  if(amqpConn){
    amqpConn.close();
    return true;
  }
}
  
}

module.exports = listenToPika;

//module.exports.start = start;
//module.exports.stop = stop;
