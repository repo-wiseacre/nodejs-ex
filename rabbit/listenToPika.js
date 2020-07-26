const amqp = require('../node_modules/amqplib/callback_api');
//console.log("------------------------------"+process.env.CLOUDAMQP_URI+"-----------------------");
var amqpConn = null;

function start(queue_name, messagestr) {
  amqp.connect(process.env.CLOUDAMQP_URI, function(error, connection) {
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
    
  });
  
  amqpConn = connection;
  whenConnected(queue_name,messagestr);
}

function whenConnected(queue_name,messagestr) {
  startConsumer(queue_name,messagestr);
}

function startConsumer(queue_name,messagestr){
  
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
    });
    setTimeout(function() {
      connection.close();
      process.exit(0)
    }, 500);  
  
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}


function stop() {
  amqpConn.close();
  return true;
}
