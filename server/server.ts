
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";

import { DB } from "./db";
import { User } from "./user";
import { Restaurant } from "./restaurant";
import { Product } from "./product";
import { Category } from "./category";
import { Order } from "./order";

const cfg = JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
const SERVER = cfg.API_SERVER;
const ROUTE_PREFIX = SERVER.ROUTE_PREFIX;

const app = express();
const dbo = new DB();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req: any, file, cb) {
      cb(null, req.body.fname);
  }
});
const upload = multer({ storage: storage });
let user: User;

dbo.init(cfg.DATABASE).then(dbClient => {
  user = new User(dbo);
  user.findOne({username: 'admin'}).then(x => {
    if(x){
      console.log('database duocun exists ...');
    }else{
      user.insertOne({username:'guest', password:'', type:'user'}).then((x: any) => {
        console.log('create database duocun and guest account ...');
        // res.setHeader('Content-Type', 'application/json');
        // res.end(JSON.stringify(x.ops[0], null, 3))
      });
    }
  });
});

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));

// const staticPath = path.resolve('client/dist');
const staticPath = path.resolve('uploads');
console.log(staticPath);
app.use(express.static(staticPath));

app.get('/' + ROUTE_PREFIX + '/users', (req, res) => {
  const user = new User(dbo);
  // user.insertOne('Jack').then((x: any) => {
  //   res.setHeader('Content-Type', 'application/json');
  //   res.end(JSON.stringify(x.ops[0], null, 3))
  // });
});

app.post('/' + ROUTE_PREFIX + '/Accounts/login', (req, res) => {
  user.login(req, res);
});
app.post('/' + ROUTE_PREFIX + '/Accounts/signup', (req, res) => {
  user.signup(req, res);
});
app.get('/' + ROUTE_PREFIX + '/Accounts/:id', (req, res) => {
  user.get(req, res);
});

app.post('/' + ROUTE_PREFIX + '/Restaurants', (req, res) => {
  const restaurant = new Restaurant(dbo);
  restaurant.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.put('/' + ROUTE_PREFIX + '/Restaurants', (req, res) => {
  const restaurant = new Restaurant(dbo);
  restaurant.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Restaurants', (req, res) => {
  const restaurant = new Restaurant(dbo);
  restaurant.find({}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Restaurants/:id', (req, res) => {
  const restaurant = new Restaurant(dbo);
  restaurant.get(req, res);
});

app.get('/' + ROUTE_PREFIX + '/Restaurants/:id/Products', (req, res) => {
  const product = new Product(dbo);
  product.find({restaurantId: req.params.id}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.put('/' + ROUTE_PREFIX + '/Products', (req, res) => {
  const product = new Product(dbo);
  product.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.post('/' + ROUTE_PREFIX + '/Products', (req, res) => {
  const product = new Product(dbo);
  product.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Products', (req: any, res) => {
  const product = new Product(dbo);
  const query = req.headers? JSON.parse(req.headers.filter) : null;
  product.find(query ? query.where: {}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Products/:id', (req, res) => {
  const product = new Product(dbo);
  product.get(req, res);
});

app.post('/' + ROUTE_PREFIX + '/Categories', (req, res) => {
  const category = new Category(dbo);
  category.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3))
  });
});

app.get('/' + ROUTE_PREFIX + '/Categories', (req, res) => {
  const category = new Category(dbo);
  category.find({}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3))
  });
});

app.get('/' + ROUTE_PREFIX + '/Categories/:id', (req, res) => {
  const category = new Category(dbo);
  category.get(req, res);
});

app.post('/' + ROUTE_PREFIX + '/Categories', (req, res) => {
  const order = new Order(dbo);
  order.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3))
  });
});

app.put('/' + ROUTE_PREFIX + '/Orders', (req, res) => {
  const order = new Order(dbo);
  order.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.post('/' + ROUTE_PREFIX + '/Orders', (req, res) => {
  const order = new Order(dbo);
  order.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Orders', (req: any, res) => {
  const order = new Order(dbo);
  const query = req.headers? JSON.parse(req.headers.filter) : null;
  order.find(query ? query.where: {}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Orders/:id', (req, res) => {
  const order = new Order(dbo);
  order.get(req, res);
});


app.post('/' + ROUTE_PREFIX + '/files/upload', upload.single('file'), (req, res, next) => {
  res.send('upload file success');
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