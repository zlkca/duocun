
import express from "express";
import fs from "fs";
import path from "path";

import { DB } from "./db";
import { User } from "./user";

const cfg = JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
const SERVER = cfg.API_SERVER;
const ROUTE_PREFIX = SERVER.ROUTE_PREFIX;

const app = express();
const dbo = new DB();

dbo.init(cfg.DATABASE).then(dbClient => {});

app.get('/' + ROUTE_PREFIX + '/users', (req, res) => {
  const db = dbo.getDb();
  const user = new User(db);
  user.insertOne('Jack').then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3))
  });
});

app.set('port', process.env.PORT || SERVER.PORT)

const server = app.listen(app.get("port"), () => {
  console.log("API is running on :%d", app.get("port"));
});

// const http = require('http');
// const express = require('express')
// const path = require('path')
// const fs = require('fs');
// const cfg = JSON.parse(fs.readFileSync('../duocun.cfg.json','utf8'));
// const DB = require('./db');
// // const User = require('./user');


// const SERVER = cfg.API_SERVER;
// const ROUTE_PREFIX = SERVER.ROUTE_PREFIX;

// const app = express();
// const db = DB().init(cfg.DATABASE);


// // body-parser does not handle multipart bodies
// var bodyParser = require('body-parser');
// var cookieParser = require('cookie-parser');

// //parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));

// // parse application/json
// app.use(bodyParser.json({ limit: '1mb' }));

// console.log(__dirname + '/dist');

// // app.use(express.static(__dirname + '/dist'));
// // app.get('*',function(req,res){
// //     res.sendFile(path.join(__dirname, '/dist/index.html'));
// // });
// //app.listen(SERVER_PORT, () => console.log('Server setup'))



// app.set('port', process.env.PORT || SERVER.PORT)

// var server = http.createServer(app)
// server.listen(app.get('port'), function () {
//   console.log('API server listening on port ' + SERVER.PORT)
// })