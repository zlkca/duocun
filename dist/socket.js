"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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