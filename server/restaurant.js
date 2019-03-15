//----------------------------------------------------
// Author:zlk
// Date: 08/02/2019
// All right reserved.
//----------------------------------------------------
'use strict';

module.exports = function(db){

  var collection;

	return {
    init: function(){
      collection = this.getCollection();
    },

    getCollection: function(){
      return db.getCollection('users');
    },

    find: function(){
      const collection = db.getCollection('users');
      collection.find();
    }
	};
}