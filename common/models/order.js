'use strict';

var pubsub = require('../../server/pubsub.js');

module.exports = function(Order) {
  // Order after save..
  Order.observe('after save', function(ctx, next) {
    console.log('asdasdas');
    var socket = Order.app.io;
    if (ctx.isNewInstance) {
      // Now publishing the data..
      pubsub.publish(socket, {
        collectionName: 'Orders',
        data: [ctx.instance],
        method: 'POST',
      });
    } else {
      // Now publishing the data..
      pubsub.publish(socket, {
        collectionName: 'Orders',
        data: ctx.instance,
        modelId: ctx.instance.id,
        method: 'PUT',
      });
    }
    // Calling the next middleware..
    next();
  }); // after save..
};
