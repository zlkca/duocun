//----------------------------------------------------
// Author:zlk
// Date: 08/02/2019
// All right reserved.
//----------------------------------------------------

'use strict';

var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = function(){
	return {

    init: function(cfg){
      // create connection pool
      const connectionStr = 'mongodb://'+ cfg.HOST + ':' + cfg.PORT + '/' + cfg.NAME;
      MongoClient.connect(connectionStr, {poolSize: cfg.POOL_SIZE}, (err, db) => {
        if(err){
          console.log('mongodb connection exception ...');
        }else{
          console.log('mongodb connected ...');
          _db = db;
        }
      });
    },

		getDatabase: function(){
			return _db;
    },
    
		getCollection: function(name){
			return _db.collection(name);
    },
    
		genObjectId: function(){
			return new Mongojs.ObjectId();
    },
    
		toObjectId: function(sId){
			return new Mongojs.ObjectId(sId);
		}
	};
}