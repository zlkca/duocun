"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
class Socket {
    constructor(dbo, io) {
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
    postAuth(socket, data) {
    }
    postDisconnect(socket) {
        console.log(socket.id + ' disconnected');
    }
}
exports.Socket = Socket;
//# sourceMappingURL=socket.js.map