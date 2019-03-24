
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import Server from "socket.io";
import { ObjectID } from "mongodb";
//import * as SocketIOAuth from "socketio-auth";

import { DB } from "./db";
import { User } from "./user";
import { Restaurant } from "./restaurant";
import { Product } from "./product";
import { Category } from "./category";
import { Order } from "./order";
import { Location } from "./location";
import { Utils } from "./utils";
import { Socket } from "./socket";

const utils = new Utils();
const cfg = utils.cfg;
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
let order: Order;
let category: Category;
let restaurant: Restaurant;
let product: Product;
let location: Location;
let socket: Socket;
let io: any;

dbo.init(cfg.DATABASE).then(dbClient => {
  io = Server(server);

  user = new User(dbo);
  order = new Order(dbo);
  category = new Category(dbo);
  restaurant = new Restaurant(dbo);
  product = new Product(dbo);
  location = new Location(dbo);
  socket = new Socket(dbo, io);

  require('socketio-auth')(io, { authenticate: (socket: any, data: any, callback: any) => {
    const uId = data.userId;
    user.findOne({_id: new ObjectID(uId)}).then( x => {
      if(x){
        callback(null, true);
      }else{
        callback(null, false);
      }
    });
  }, timeout: 200000});

  // io.on("updateOrders", (x: any) => {
  //   const ss = x;
  // });

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

app.get('/wx', (req, res) => {
  utils.genWechatToken(req, res);
});

app.get('/' + ROUTE_PREFIX + '/geocode', (req, res) => {
  utils.getGeocode(req, res);
});
app.get('/' + ROUTE_PREFIX + '/places', (req, res) => {
  utils.getPlaces(req, res);
});
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
  restaurant.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.put('/' + ROUTE_PREFIX + '/Restaurants', (req, res) => {
  restaurant.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Restaurants', (req, res) => {
  restaurant.find({}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Restaurants/:id', (req, res) => {
  restaurant.get(req, res);
});
app.delete('/' + ROUTE_PREFIX + '/Restaurants/:id', (req, res) => {
  restaurant.deleteById(req.params.id).then(x => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Restaurants/:id/Products', (req, res) => {
  product.find({restaurantId: req.params.id}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.put('/' + ROUTE_PREFIX + '/Products', (req, res) => {
  product.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.post('/' + ROUTE_PREFIX + '/Products', (req, res) => {
  product.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Products', (req: any, res) => {
  const query = req.headers? JSON.parse(req.headers.filter) : null;
  product.find(query ? query.where: {}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Products/:id', (req, res) => {
  product.get(req, res);
});
app.delete('/' + ROUTE_PREFIX + '/Products/:id', (req, res) => {
  product.deleteById(req.params.id).then(x => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.post('/' + ROUTE_PREFIX + '/Categories', (req, res) => {
  category.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3))
  });
});

app.get('/' + ROUTE_PREFIX + '/Categories', (req, res) => {
  category.find({}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3))
  });
});

app.get('/' + ROUTE_PREFIX + '/Categories/:id', (req, res) => {
  category.get(req, res);
});

app.post('/' + ROUTE_PREFIX + '/Categories', (req, res) => {
  order.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3))
  });
});

app.put('/' + ROUTE_PREFIX + '/Orders', (req, res) => {
  order.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.ops[0], null, 3));
  });
});

app.post('/' + ROUTE_PREFIX + '/Orders', (req, res) => {
  order.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    io.emit('updateOrders', x);
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Orders', (req: any, res) => {
  const query = req.headers? JSON.parse(req.headers.filter) : null;
  order.find(query ? query.where: {}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Orders/:id', (req, res) => {
  order.get(req, res);
});

app.post('/' + ROUTE_PREFIX + '/Locations', (req, res) => {
  location.find({userId: req.body.userId, placeId: req.body.placeId}).then((r: any) => {
    if(r && r.length > 0){
      res.send(JSON.stringify(null, null, 3));
    }else{
      location.insertOne(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        io.emit('updateOrders', x);
        res.end(JSON.stringify(x, null, 3));
      });
    }
  });
});

app.get('/' + ROUTE_PREFIX + '/Locations', (req: any, res) => {
  const query = req.headers? JSON.parse(req.headers.filter) : null;
  res.setHeader('Content-Type', 'application/json');
  if(query){
    location.find(query.where).then((x: any) => {
      res.end(JSON.stringify(x, null, 3));
    });
  }else{
    res.end(JSON.stringify(null, null, 3));
  }
});

app.post('/' + ROUTE_PREFIX + '/files/upload', upload.single('file'), (req, res, next) => {
  res.send('upload file success');
});


app.use(express.static(path.join(__dirname, '/../uploads')));
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