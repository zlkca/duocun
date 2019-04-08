"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = __importDefault(require("socket.io"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
//import * as SocketIOAuth from "socketio-auth";
const db_1 = require("./db");
const user_1 = require("./user");
const restaurant_1 = require("./restaurant");
const product_1 = require("./product");
const category_1 = require("./category");
const order_1 = require("./order");
const mall_1 = require("./mall");
const location_1 = require("./location");
const distance_1 = require("./distance");
const contact_1 = require("./contact");
const utils_1 = require("./utils");
// console.log = function (msg: any) {
//   fs.appendFile("/tmp/log-duocun.log", msg, function (err) { });
// }
const utils = new utils_1.Utils();
const cfg = new config_1.Config();
const SERVER = cfg.API_SERVER;
const ROUTE_PREFIX = SERVER.ROUTE_PREFIX;
const app = express_1.default();
const dbo = new db_1.DB();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, req.body.fname);
    }
});
const upload = multer_1.default({ storage: storage });
let user;
let order;
let category;
let restaurant;
let product;
let mall;
let location;
let distance;
let contact;
let mysocket; // Socket;
let io;
dbo.init(cfg.DATABASE).then(dbClient => {
    io = socket_io_1.default(server);
    user = new user_1.User(dbo);
    order = new order_1.Order(dbo);
    category = new category_1.Category(dbo);
    restaurant = new restaurant_1.Restaurant(dbo);
    product = new product_1.Product(dbo);
    mall = new mall_1.Mall(dbo);
    location = new location_1.Location(dbo);
    distance = new distance_1.Distance(dbo);
    contact = new contact_1.Contact(dbo);
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
    io.on('connection', function (socket) {
        console.log('server socket connected:' + socket.id);
        socket.on('authentication', function (token) {
            const cfg = new config_1.Config();
            if (token) {
                jsonwebtoken_1.default.verify(token, cfg.JWT.SECRET, { algorithms: [cfg.JWT.ALGORITHM] }, (err, decoded) => {
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
            }
            else {
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
app.use(cors_1.default());
app.use(body_parser_1.default.urlencoded({ extended: false, limit: '1mb' }));
app.use(body_parser_1.default.json({ limit: '1mb' }));
// const staticPath = path.resolve('client/dist');
const staticPath = path_1.default.resolve('uploads');
console.log(staticPath + '/n/r');
app.use(express_1.default.static(staticPath));
app.get('/wx', (req, res) => {
    utils.genWechatToken(req, res);
});
app.get('/' + ROUTE_PREFIX + '/geocode', (req, res) => {
    utils.getGeocode(req, res);
});
app.get('/' + ROUTE_PREFIX + '/places', (req, res) => {
    utils.getPlaces(req, res);
});
app.post('/' + ROUTE_PREFIX + '/distances', (req, res) => {
    utils.getRoadDistances(req, res);
});
app.get('/' + ROUTE_PREFIX + '/users', (req, res) => {
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
    restaurant.insertOne(req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.put('/' + ROUTE_PREFIX + '/Restaurants', (req, res) => {
    restaurant.replaceById(req.body.id, req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Restaurants', (req, res) => {
    const query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    restaurant.find(query ? query.where : {}).then((x) => {
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
    product.find({ restaurantId: req.params.id }).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.put('/' + ROUTE_PREFIX + '/Products', (req, res) => {
    product.replaceById(req.body.id, req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.post('/' + ROUTE_PREFIX + '/Products', (req, res) => {
    product.insertOne(req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Products', (req, res) => {
    const query = req.headers ? JSON.parse(req.headers.filter) : null;
    product.find(query ? query.where : {}).then((x) => {
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
    category.insertOne(req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Categories', (req, res) => {
    const query = req.headers ? JSON.parse(req.headers.filter) : null;
    category.find(query ? query.where : {}).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Categories/:id', (req, res) => {
    category.get(req, res);
});
app.post('/' + ROUTE_PREFIX + '/Categories', (req, res) => {
    order.insertOne(req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x.ops[0], null, 3));
    });
});
app.put('/' + ROUTE_PREFIX + '/Orders', (req, res) => {
    let d = req.body;
    if (d.restaurantStatus === 'process') {
        d.status = 'cooking';
    }
    if (d.restaurantStatus === 'done') {
        d.status = 'finished cooking';
    }
    if (d.workerStatus === 'process') {
        d.status = 'delivering';
    }
    if (d.workerStatus === 'done') {
        d.status = 'delivered';
    }
    // fix me!!!
    user.findOne({ username: 'worker' }).then(worker => {
        d.workerId = worker.id.toString();
        order.replaceById(req.body.id, d).then((x) => {
            res.setHeader('Content-Type', 'application/json');
            io.emit('updateOrders', x);
            res.end(JSON.stringify(x, null, 3));
        });
    });
});
app.post('/' + ROUTE_PREFIX + '/Orders', (req, res) => {
    order.insertOne(req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        io.emit('updateOrders', x);
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Orders', (req, res) => {
    const query = req.headers ? JSON.parse(req.headers.filter) : null;
    order.find(query ? query.where : {}).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Orders/:id', (req, res) => {
    order.get(req, res);
});
app.put('/' + ROUTE_PREFIX + '/Malls', (req, res) => {
    mall.replaceById(req.body.id, req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.post('/' + ROUTE_PREFIX + '/Malls', (req, res) => {
    mall.insertOne(req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Malls', (req, res) => {
    const query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    mall.find(query ? query.where : {}).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Malls/:id', (req, res) => {
    mall.get(req, res);
});
app.post('/' + ROUTE_PREFIX + '/Locations', (req, res) => {
    location.find({ userId: req.body.userId, placeId: req.body.placeId }).then((r) => {
        if (r && r.length > 0) {
            res.send(JSON.stringify(null, null, 3));
        }
        else {
            location.insertOne(req.body).then((x) => {
                res.setHeader('Content-Type', 'application/json');
                io.emit('updateOrders', x);
                res.end(JSON.stringify(x, null, 3));
            });
        }
    });
});
app.get('/' + ROUTE_PREFIX + '/Locations', (req, res) => {
    const query = req.headers ? JSON.parse(req.headers.filter) : null;
    res.setHeader('Content-Type', 'application/json');
    if (query) {
        location.find(query.where).then((x) => {
            res.end(JSON.stringify(x, null, 3));
        });
    }
    else {
        res.end(JSON.stringify(null, null, 3));
    }
});
app.put('/' + ROUTE_PREFIX + '/Distances', (req, res) => {
    distance.replaceById(req.body.id, req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.post('/' + ROUTE_PREFIX + '/Distances', (req, res) => {
    distance.insertOne(req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Distances', (req, res) => {
    const query = req.headers ? JSON.parse(req.headers.filter) : null;
    distance.find(query ? query.where : {}).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Distances/:id', (req, res) => {
    distance.get(req, res);
});
app.post('/' + ROUTE_PREFIX + '/smsverify', (req, res) => {
    contact.verifyCode(req, res);
});
app.post('/' + ROUTE_PREFIX + '/sendVerifyMsg', (req, res) => {
    contact.sendVerificationMessage(req, res);
});
app.post('/' + ROUTE_PREFIX + '/Contacts', (req, res) => {
    contact.insertOne(req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        x.verificationCode = '';
        res.end(JSON.stringify(x, null, 3));
    });
});
app.put('/' + ROUTE_PREFIX + '/Contacts', (req, res) => {
    contact.replaceById(req.body.id, req.body).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        x.verificationCode = '';
        res.end(JSON.stringify(x, null, 3));
    });
});
app.get('/' + ROUTE_PREFIX + '/Contacts', (req, res) => {
    const query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    contact.find(query ? query.where : {}).then((x) => {
        res.setHeader('Content-Type', 'application/json');
        x[0].verificationCode = '';
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
app.use(express_1.default.static(path_1.default.join(__dirname, '/../uploads')));
app.set('port', process.env.PORT || SERVER.PORT);
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
//# sourceMappingURL=server.js.map