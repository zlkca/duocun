"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class DB {
    constructor() {
    }
    init(cfg) {
        const connectionStr = 'mongodb://' + cfg.HOST + ':' + cfg.PORT + '/' + cfg.NAME;
        const options = {
            poolSize: cfg.POOL_SIZE,
            useNewUrlParser: true
        };
        return new Promise((resolve, reject) => {
            mongodb_1.MongoClient.connect(connectionStr, options).then((connectClient) => {
                const d = connectClient.db(cfg.NAME);
                this.db = d;
                console.log('mongodb connected ...');
                resolve(d);
            }, (err) => {
                console.log('mongodb connection exception ...');
                reject(err);
            });
        });
    }
    getDb() {
        return this.db;
    }
}
exports.DB = DB;
// let _db : any;
// module.exports = function(){
// 	return {
//     init: function(cfg: any){
//       // create connection pool
//       const connectionStr = 'mongodb://'+ cfg.HOST + ':' + cfg.PORT + '/' + cfg.NAME;
//       MongoClient.connect(connectionStr, {poolSize: cfg.POOL_SIZE}).then((client: MongoClient) => {
//         // if(err){
//         //   console.log('mongodb connection exception ...');
//         // }else{
//         //   console.log('mongodb connected ...');
//         //   _db = db;
//         // }
//       });
//     },
// 		getDatabase: function(){
// 			return _db;
//     },
// 		getCollection: function(name: string){
// 			return _db.collection(name);
//     },
// 		genObjectId: function(){
// 			return null; // new Mongojs.ObjectId();
//     },
// 		toObjectId: function(id: string){
// 			return null; // new Mongojs.ObjectId(sId);
// 		}
// 	};
// }
//# sourceMappingURL=db.js.map