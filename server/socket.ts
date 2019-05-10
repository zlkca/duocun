import { Request, Response } from "express";
import https from 'https';
import { DB } from "./db";
import { ObjectID } from "mongodb";


// socket.emit('message', "this is a test"); //sending to sender-client only
// socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender
// socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender
// socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)
// socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid
// io.emit('message', "this is a test"); //sending to all clients, include sender
// io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender
// io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender
// socket.emit(); //send to all connected clients
// socket.broadcast.emit(); //send to all connected clients except the one that sent the message
// socket.on(); //event listener, can be called on client to execute on server
// io.sockets.socket(); //for emiting to specific clients
// io.sockets.emit(); //send to all connected clients (same as socket.emit)
// io.sockets.on() ; //initial connection from a client.

export class Socket {
  private dbo: any;
  private io: any;

  constructor(dbo: DB, io: any) {
    this.dbo = dbo;
    this.io = io;
  }

  // auth(socket: any, data: any, callback: any){
  //   const uId = data.userId;
  //   const user = new User(this.dbo);
  //   user.findOne({_id: new ObjectID(uId)}).then( x => {
  //     if(x){
  //       callback(null, true);
  //     }else{
  //       callback(null, false);
  //     }
  //   });
  // }

  postAuth(socket: any, data: any){

  }

  postDisconnect(socket: any){
    console.log(socket.id + ' disconnected');
  }

  // publish(socket, options) {
  //   if (options) {
  //     var collectionName = options.collectionName;
  //     var method = options.method;
  //     var data = options.data;
  //     var modelId = options.modelId;
  //     if (method === 'POST') {
  //       // eg. "[POST]http://localhost:3000/api/Orders"
  //       var postEventName = 'updateOrders'; // '[' + method + ']' + baseUrl + '/api/' + collectionName;
  //       this.io.emit(postEventName, data);
  //     } else {
  //       var name = '[' + method + ']' + baseUrl + '/api/' + collectionName + '/' + modelId;
  //       socket.emit(name, data);
  //     }
  //   } else {
  //     throw 'Error: Option must be an object type';
  //   }
  // }, // End Publish..

}