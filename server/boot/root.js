'use strict';

var path = require('path');
var crypto = require('crypto');

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  // router.get('/', server.loopback.status());

  router.get('/wx', (req, res)=>{
    let token = 'testToken20';
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;
    let signature = req.query.signature;
    let echostr = req.query.echostr;
    let list = [token, timestamp, nonce].sort();
    let sha1 = crypto.createHash('sha1');
    let s = list.join('');
    let hash = sha1.update(s).digest('hex');
    console.log(hash);
    if (hash === signature) {
      res.send(echostr);
    } else {
      res.send('');
    }
  });

  server.use(router);
};
