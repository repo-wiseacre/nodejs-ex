const amqp = require('../node_modules/amqplib/callback_api');
//console.log("------------------------------"+process.env.CLOUDAMQP_URI+"-----------------------");
var amqpConn = null;

function whenConnected(queue_name,messagestr, amqpConn) {
  startPublisher(queue_name,messagestr, amqpConn);
}
var tellToPika = {  
  start:function(queue_name, messagestr, amqpConn) {
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
      });
      whenConnected(queue_name,messagestr, amqpConn);
  },
 
  startPublisher:function(queue_name,messagestr,amqpConn){

    amqpConn.createChannel(function(error1, channel) {

        let queue = queue_name; //'callAPIRequest';
        let msg   = messagestr;//'start_calling_api';

        channel.assertQueue(queue, {
          durable: true
        });
        if (closeOnErr(error1)) return;
        console.log("send to queue tell to pika")
        channel.sendToQueue(queue, Buffer.from(msg), {
          persistent: true
        });
        console.log("Sent '%s'", msg);
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


module.exports = tellToPika;
//module.exports.start = start
//module.exports.stop = stop
