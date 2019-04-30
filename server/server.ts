
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import Server from "socket.io";
import { ObjectID } from "mongodb";

import jwt from "jsonwebtoken";
import { Config } from "./config";
//import * as SocketIOAuth from "socketio-auth";

import { DB } from "./db";
import { User } from "./user";
import { Restaurant } from "./restaurant";
import { Product } from "./product";
import { Category } from "./category";
import { Order } from "./order";
import { Mall } from "./mall";
import { Location } from "./location";
import { Distance } from "./distance";
import { Contact } from "./contact";
import { Phone } from "./phone";
import { MerchantStuff } from "./merchant-stuff";
import { Picture } from "./picture";
import { Utils } from "./utils";
import { Socket } from "./socket";

// console.log = function (msg: any) {
//   fs.appendFile("/tmp/log-duocun.log", msg, function (err) { });
// }

const utils = new Utils();
const cfg = new Config();
const SERVER = cfg.API_SERVER;
const ROUTE_PREFIX = SERVER.ROUTE_PREFIX;

const app = express();
const dbo = new DB();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req: any, file, cb) {
      cb(null, req.body.fname + '.' + req.body.ext);
  }
});
const upload = multer({ storage: storage });
// const upload = multer({ dest: 'uploads/' });
let user: User;
let order: Order;
let category: Category;
let restaurant: Restaurant;
let product: Product;
let mall: Mall;
let location: Location;
let distance: Distance;
let contact: Contact;
let phone: Phone;
let merchantStuff: MerchantStuff;
let picture: Picture;
let mysocket: any;// Socket;
let io: any;

dbo.init(cfg.DATABASE).then(dbClient => {
  io = Server(server);

  user = new User(dbo);
  order = new Order(dbo);
  category = new Category(dbo);
  restaurant = new Restaurant(dbo);
  product = new Product(dbo);
  mall = new Mall(dbo);
  location = new Location(dbo);
  distance = new Distance(dbo);
  contact = new Contact(dbo);
  phone = new Phone(dbo);
  merchantStuff = new MerchantStuff(dbo);
  picture = new Picture();
  // socket = new Socket(dbo, io);

  // require('socketio-auth')(io, { authenticate: (socket: any, data: any, callback: any) => {
  //   const uId = data.userId;
  //   console.log('socketio connecting with uid: ' + uId + '/n');
  //   if(uId){
  //     user.findOne({_id: new ObjectID(uId)}).then( x => {
  //       if(x){
  //         callback(null, true);
  //       }else{
  //         callback(null, false);
  //       }
  //     });
  //   }else{
  //     callback(null, false);
  //   }
  // }, timeout: 200000});


  io.on('connection', function (socket: any) {
    console.log('server socket connected:' + socket.id);
    
    socket.on('authentication', function (token: any) {
      const cfg = new Config();
      if(token){
        jwt.verify(token, cfg.JWT.SECRET, {algorithms:[cfg.JWT.ALGORITHM]}, (err, decoded: any) => {
          if(err){
            console.log('socket authentication error:' + err);
          }
          if (decoded) {
            console.log('socket authenticated:' + decoded.id);
            if (decoded.id) {
              socket.emit('authenticated', { userId: decoded.id });
            }
          }
        });
      } else {
        console.log('socket authentication failed: access token is null.');
      }
    });

    socket.on('disconnect', () => {
      console.log('server socket disconnect');
    });
  });

  // io.on("updateOrders", (x: any) => {
  //   const ss = x;
  // });

  // user.findOne({username: 'admin'}).then(x => {
  //   if(x){
  //     console.log('database duocun exists .../n');
  //   }else{
  //     user.insertOne({username:'guest', password:'', type:'user'}).then((x: any) => {
  //       console.log('create database duocun and guest account .../n');
  //       // res.setHeader('Content-Type', 'application/json');
  //       // res.end(JSON.stringify(x.ops[0], null, 3))
  //     });
  //   }
  // });
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));

// const staticPath = path.resolve('client/dist');
const staticPath = path.resolve('uploads');
console.log(staticPath + '/n/r');
app.use(express.static(staticPath));

app.get('/wx', (req, res) => {
  utils.genWechatToken(req, res);
});
app.get('/' + ROUTE_PREFIX + '/wechatLogin', (req, res) => {
  user.wechatLogin(req, res);
});
// app.get('/wechatAccessToken', (req, res) => {
//   utils.getWechatAccessToken(req, res);
// });
// app.get('/wechatRefreshAccessToken', (req, res) => {
//   utils.refreshWechatAccessToken(req, res);
// });
app.get('/' + ROUTE_PREFIX + '/geocodeLocations', (req, res) => {
  utils.getGeocodeLocationList(req, res);
});
app.get('/' + ROUTE_PREFIX + '/places', (req, res) => {
  utils.getPlaces(req, res);
});
app.post('/' + ROUTE_PREFIX + '/distances', (req, res) => {
  distance.reqRoadDistances(req, res);
});
app.get('/' + ROUTE_PREFIX + '/users', (req, res) => {
});
app.post('/' + ROUTE_PREFIX + '/files/upload', upload.single('file'), (req, res) => {
  product.uploadPicture(req, res);
});
app.get('/' + ROUTE_PREFIX + '/Pictures', (req, res) => {
  picture.get(req, res);
});

app.post('/' + ROUTE_PREFIX + '/Accounts/applyMerchant', (req, res) => {
  merchantStuff.applyMerchant(req, res);
});
app.post('/' + ROUTE_PREFIX + '/Accounts/getMerchantApplication', (req, res) => {
  merchantStuff.getApplication(req, res);
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
app.patch('/' + ROUTE_PREFIX + '/Accounts', (req, res) => {
  user.updateOne(req.body.filter, req.body.data).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x.result, null, 3)); // {n: 1, nModified: 1, ok: 1}
  });
});

app.post('/' + ROUTE_PREFIX + '/Restaurants', (req, res) => {
  restaurant.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.put('/' + ROUTE_PREFIX + '/Restaurants', (req, res) => {
  restaurant.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Restaurants', (req: any, res) => {
  const query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
  restaurant.find(query ? query.where: {}).then((x: any) => {
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
  product.find({merchantId: req.params.id}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.put('/' + ROUTE_PREFIX + '/Products', (req, res) => {
  product.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.post('/' + ROUTE_PREFIX + '/Products', (req, res) => {
  product.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});
app.get('/' + ROUTE_PREFIX + '/Products', (req: any, res) => {
  const query = req.headers && req.headers.filter ? JSON.parse(req.headers.filter) : null;
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
    res.end(JSON.stringify(x, null, 3))
  });
});
app.get('/' + ROUTE_PREFIX + '/Categories', (req: any, res) => {
  const query = req.headers? JSON.parse(req.headers.filter) : null;
  category.find(query ? query.where: {}).then((x: any) => {
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
  let d = req.body;

  if(d.merchantStatus === 'process'){
    d.status = 'cooking';
  }
  if(d.merchantStatus === 'done'){
    d.status = 'finished cooking';
  }
  if(d.workerStatus === 'process'){
    d.status = 'delivering';
  }
  if(d.workerStatus === 'done'){
    d.status = 'delivered';
  }

  order.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    io.emit('updateOrders', x);
    res.end(JSON.stringify(x, null, 3));
  });

  // fix me!!!
  // user.findOne({username: 'worker'}).then(worker => {
  //   d.stuffId = worker.id.toString();
  //   order.replaceById(req.body.id, d).then((x: any) => {
  //     res.setHeader('Content-Type', 'application/json');
  //     io.emit('updateOrders', x);
  //     res.end(JSON.stringify(x, null, 3));
  //   });
  // });
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
app.delete('/' + ROUTE_PREFIX + '/Orders/:id', (req, res) => {
  order.deleteById(req.params.id).then(x => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.put('/' + ROUTE_PREFIX + '/Malls', (req, res) => {
  mall.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});
app.post('/' + ROUTE_PREFIX + '/Malls', (req, res) => {
  mall.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});
app.get('/' + ROUTE_PREFIX + '/Malls', (req: any, res) => {
  const query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
  mall.find(query ? query.where: {}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});
app.get('/' + ROUTE_PREFIX + '/Malls/:id', (req, res) => {
  mall.get(req, res);
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


app.put('/' + ROUTE_PREFIX + '/Distances', (req, res) => {
  distance.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.post('/' + ROUTE_PREFIX + '/Distances', (req, res) => {
  distance.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});
app.get('/' + ROUTE_PREFIX + '/Distances', (req: any, res) => {
  const query = req.headers? JSON.parse(req.headers.filter) : null;
  distance.find(query ? query.where: {}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.get('/' + ROUTE_PREFIX + '/Distances/:id', (req, res) => {
  distance.get(req, res);
});

app.post('/' + ROUTE_PREFIX + '/smsverify', (req, res) => {
  phone.verifyCode(req, res);
});
app.post('/' + ROUTE_PREFIX + '/sendVerifyMsg', (req, res) => {
  phone.sendVerificationMessage(req, res);
});

app.post('/' + ROUTE_PREFIX + '/Contacts', (req, res) => {
  contact.insertOne(req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    x.verificationCode = '';
    res.end(JSON.stringify(x, null, 3));
  });
});
app.put('/' + ROUTE_PREFIX + '/Contacts', (req, res) => {
  contact.replaceById(req.body.id, req.body).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    x.verificationCode = '';
    res.end(JSON.stringify(x, null, 3));
  });
});
app.get('/' + ROUTE_PREFIX + '/Contacts', (req: any, res) => {
  const query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
  contact.find(query ? query.where: {}).then((x: any) => {
    res.setHeader('Content-Type', 'application/json');
    if(x && x.length>0){
      x[0].verificationCode = '';
    }
    res.end(JSON.stringify(x, null, 3));
  });
});
app.get('/' + ROUTE_PREFIX + '/Contacts/:id', (req, res) => {
  contact.get(req, res);
});
app.delete('/' + ROUTE_PREFIX + '/Contacts/:id', (req, res) => {
  contact.deleteById(req.params.id).then(x => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(x, null, 3));
  });
});

app.post('/' + ROUTE_PREFIX + '/files/upload', upload.single('file'), (req, res, next) => {
  res.send('upload file success');
});


app.use(express.static(path.join(__dirname, '/../uploads')));
app.set('port', process.env.PORT || SERVER.PORT)

const server = app.listen(app.get("port"), () => {
  console.log("API is running on :%d/n", app.get("port"));
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