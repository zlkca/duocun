const http = require('http');
const express = require('express')
const path = require('path')
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('../duocun.cfg.json','utf8'));
const DB = require('./db');
const User = require('./user');


const SERVER = cfg.API_SERVER;
const ROUTE_PREFIX = SERVER.ROUTE_PREFIX;

const app = express();
const db = DB().init(cfg.DATABASE);


// body-parser does not handle multipart bodies
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));

// parse application/json
app.use(bodyParser.json({ limit: '1mb' }));

console.log(__dirname + '/dist');

// app.use(express.static(__dirname + '/dist'));
// app.get('*',function(req,res){
//     res.sendFile(path.join(__dirname, '/dist/index.html'));
// });
//app.listen(SERVER_PORT, () => console.log('Server setup'))

app.get(ROUTE_PREFIX + '/users', (req, res) => {
  const user = new User(db);
});

app.set('port', process.env.PORT || SERVER.PORT)

var server = http.createServer(app)
server.listen(app.get('port'), function () {
  console.log('API server listening on port ' + SERVER.PORT)
})