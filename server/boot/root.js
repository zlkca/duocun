'use strict';

var path = require('path');
var crypto = require('crypto');
var https = require('https');

module.exports = function(server) {
  // var ds = server.loopback.createDataSource({
  //   connector: require("loopback-connector-rest"),
  //   debug: false,
  //   baseURL: 'http://localhost:3000'
  // });

  // var Location = ds.createModel('location', {
  //   streetName: String,
  //   streetNumber: String,
  // });

  // Location.geocode(function(err, user) {
  //   console.log(user);
  // });

  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  // router.get('/', server.loopback.status());

  router.get('/wx', (req, res) => {
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

  router.get('/api/geocode', (req, res) => {
    let key = 'AIzaSyAjpSxjBTkdzKMcqAAmq72UY1-DTjl8b0s';
    let latlng = req.query.lat + ',' + req.query.lng;
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&key=' + key + '&latlng=' + latlng;
    https.get(url, (res1) => {
      let data = '';
      res1.on('data', (d) => {
        // process.stdout.write(d);
        data += d;
      });

      res1.on('end', ()=>{
        const s = JSON.parse(data);
        res.send(s.results[0]);
      });
    });
  });

  server.use(router);
};

