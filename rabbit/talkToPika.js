const amqp = require('../node_modules/amqplib/callback_api');
//console.log("------------------------------"+process.env.CLOUDAMQP_URI+"-----------------------");

function start(queue_name, messagestr) {
  amqp.connect(process.env.CLOUDAMQP_URI, function(error, connection) {
    if (error) {
      throw error;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }

      let queue = queue_name; //'callAPIRequest';
      let msg   = messagestr;//'start_calling_api';

      channel.assertQueue(queue, {
        durable: true
      });
      channel.sendToQueue(queue, Buffer.from(msg), {
        persistent: true
      });
      console.log("Sent '%s'", msg);
    });
    setTimeout(function() {
      connection.close();
      process.exit(0)
    }, 500);
  });
  
  whenConnected();
}

function whenConnected() {
  startPublisher();
  startConsumer();
}

function stop(queue_name) {
  amqp.connect(process.env.CLOUDAMQP_URI, function(error, connection) {
    if (error) {
      throw error;
    }
    
  }
  
}
