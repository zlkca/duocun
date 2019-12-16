
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
import { Utils } from "./utils";
import { Socket } from "./socket";

import { AccountRouter } from "./routers/account-route";
import { DistanceRouter } from "./routers/distance-route";
import { OrderRouter } from "./routers/order-route";
import { AssignmentRouter } from "./routers/assignment-route";
import { MerchantPaymentRouter } from "./routers/merchant-payment-route";
import { MerchantBalanceRouter } from "./routers/merchant-balance-route";
import { MerchantScheduleRouter } from "./routers/merchant-schedule-route";
import { MallScheduleRouter } from "./routers/mall-schedule-route";

import { ClientPaymentRouter } from "./routers/client-payment-route";
import { ClientBalanceRouter } from "./routers/client-balance-route";
import { DriverPaymentRouter } from "./routers/driver-payment-route";
import { DriverBalanceRouter } from "./routers/driver-balance-route";
import { RegionRouter } from "./routers/region-route";
import { TransactionRouter } from "./routers/transaction-route";
import { OrderSequenceRouter } from "./routers/order-sequence-route";
import { DriverHourRouter } from "./routers/driver-hour-route";
import { CategoryRouter } from "./routers/category-route";
import { RestaurantRouter } from "./routers/restaurant-route";
import { ProductRouter } from "./routers/product-route";
import { ContactRouter } from "./routers/contact-route";
import { RangeRouter } from "./routers/range-route";
import { MallRouter } from "./routers/mall-route";
import { LocationRouter } from "./routers/location-route";
import { PickupRouter } from "./routers/pickup-route";
import { DriverRouter } from "./routers/driver-route";
import { DriverShiftRouter } from "./routers/driver-shift-route";
import { DriverScheduleRouter } from "./routers/driver-schedule-route";
import { CellApplicationRouter } from "./routers/cell-application-route";

import { AreaRouter } from './routers/area-route';

import { Product } from "./models/product";

import { ApiMiddleWare } from "./api-middleware";
import { schedule } from "node-cron";

import { ClientBalance } from "./models/client-balance";
import { Order } from "./models/order";


process.env.TZ = 'America/Toronto';

function startCellOrderTask(dbo: any){
  // s m h d m w
  schedule('0 30 23 27 * *', () => {
    const orderModel = new Order(dbo);
    orderModel.createMobilePlanOrders();
  });
}
// schedule('0 45 23 * * *', () => {
//   let cb = new ClientBalance(dbo);
//   cb.updateAll();
// });

// console.log = function (msg: any) {
//   fs.appendFile("/tmp/log-duocun.log", msg, function (err) { });
// }

const apimw = new ApiMiddleWare();
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
let mysocket: any;// Socket;
let io: any;

function setupSocket(server: any) {
  io = Server(server);

  io.on('connection', function (socket: any) {
    console.log('server socket connected:' + socket.id);

    socket.on('authentication', function (token: any) {
      const cfg = new Config();
      if (token) {
        jwt.verify(token, cfg.JWT.SECRET, { algorithms: [cfg.JWT.ALGORITHM] }, (err, decoded: any) => {
          if (err) {
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
}

// create db connection pool and return connection instance
dbo.init(cfg.DATABASE).then(dbClient => {
  // socket = new Socket(dbo, io);
  startCellOrderTask(dbo);
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



  // io.on("updateOrders", (x: any) => {
  //   const ss = x;
  // });


  app.get('/wx', (req, res) => {
    utils.genWechatToken(req, res);
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

  app.get('/' + ROUTE_PREFIX + '/users', (req, res) => {
  });

  app.post('/' + ROUTE_PREFIX + '/files/upload', upload.single('file'), (req, res) => {
    const product = new Product(dbo);
    product.uploadPicture(req, res);
  });

  // app.get('/' + ROUTE_PREFIX + '/Pictures', (req, res) => {
  //   picture.get(req, res);
  // });

  app.post('/' + ROUTE_PREFIX + '/files/upload', upload.single('file'), (req, res, next) => {
    res.send('upload file success');
  });


  app.use(apimw.auth);

  app.use('/' + ROUTE_PREFIX + '/Categories', CategoryRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Restaurants', RestaurantRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Products', ProductRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Contacts', ContactRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Ranges', RangeRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Malls', MallRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Locations', LocationRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Pickups', PickupRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Drivers', DriverRouter(dbo));

  app.use('/' + ROUTE_PREFIX + '/Accounts', AccountRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Distances', DistanceRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Regions', RegionRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Orders', OrderRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Assignments', AssignmentRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/MerchantPayments', MerchantPaymentRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/MerchantBalances', MerchantBalanceRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/MerchantSchedules', MerchantScheduleRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/MallSchedules', MallScheduleRouter(dbo));

  app.use('/' + ROUTE_PREFIX + '/ClientPayments', ClientPaymentRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/ClientBalances', ClientBalanceRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/DriverPayments', DriverPaymentRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/DriverBalances', DriverBalanceRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/Transactions', TransactionRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/OrderSequences', OrderSequenceRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/DriverHours', DriverHourRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/DriverShifts', DriverShiftRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/DriverSchedules', DriverScheduleRouter(dbo));
  app.use('/' + ROUTE_PREFIX + '/CellApplications', CellApplicationRouter(dbo));

  app.use('/' + ROUTE_PREFIX + '/Areas', AreaRouter(dbo));

  app.use(express.static(path.join(__dirname, '/../uploads')));
  app.set('port', process.env.PORT || SERVER.PORT);

  const server = app.listen(app.get("port"), () => {
    console.log("API is running on :%d/n", app.get("port"));
  });

  // setupSocket(server);
});


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));

// const staticPath = path.resolve('client/dist');
const staticPath = path.resolve('uploads');
console.log(staticPath + '/n/r');
app.use(express.static(staticPath));


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