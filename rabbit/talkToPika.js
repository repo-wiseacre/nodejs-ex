const amqp = require('../node_modules/amqplib/callback_api');
//console.log("------------------------------"+process.env.CLOUDAMQP_URI+"-----------------------");
amqp.connect(process.env.CLOUDAMQP_URI, function(error, connection) {
  if (error) {
    throw error;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    let queue = 'pika-pika';
    let msg = 'Test message';

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
