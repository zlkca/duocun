'use strict';

var pubsub = require('../../server/pubsub.js');

module.exports = function(Order) {
  // Order --- backend operation hook 'after save'
  Order.observe('after save', function(ctx, next) {
    console.log('push order from backend');
    var socket = Order.app.io;
    if (ctx.isNewInstance) {
      pubsub.publish(socket, {
        collectionName: 'Orders',
        data: [ctx.instance],
        method: 'POST',
      });
    } else {
      pubsub.publish(socket, {
        collectionName: 'Orders',
        data: ctx.instance,
        modelId: ctx.instance.id,
        method: 'PUT',
      });
    }
    // Calling the next middleware..
    next();
  });
};

