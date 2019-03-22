import { Request, Response } from "express";
import https from 'https';
import { DB } from "./db";
import { User } from "./user";
import { ObjectID } from "mongodb";

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