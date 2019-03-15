import { Db } from "mongodb";
import { Request, Response } from "express";

import { Entity } from "./entity";

export class User extends Entity{
  	constructor(db: Db) {
		super(db, 'users');
	}

	signup(req: Request, rsp: Response){
		const user = req.body;
		const dt = new Date();
		user['created'] = dt.toISOString();
		
		if(user.hasOwnProperty('_id')){
			this.findOne({_id: user._id}).then((r: any){
				if(r != null){
					// validateSignup(user, function(errors){
					// 	saveUser(user, errors, rsp);
					// });
				}else{
					//rsp.json({'errors': [Error.UPDATE_USER_EXCEPTION], 'token':''});
				}
			});
		}else{
			// validateSignup(user, function(errors){
			// 	saveUser(user, errors, rsp);
			// });
		}
	}
}


// 'use strict';


// module.exports = function(db){

//   var collection;

// 	return {
//     init: function(){
//       collection = this.getCollection();
//     },

//     getCollection(){
//       return db.getCollection('users');
// 		},
		
//   //   //-------------------------------------------------------------------------
// 	// 	// signup 
// 	// 	//-------------------------------------------------------------------------

		
// 	// 	//-------------------------------------------------------------------------
// 	// 	// login pass token and user object to the front end
// 	// 	// Arguments:
// 	// 	// req --- req object
// 	// 	// rsp
// 	// 	//-------------------------------------------------------------------------
// 	// 	login: function(req, rsp){
// 	// 		var credential = {account: req.body.account, password: req.body.password};
// 	// 		validateLoginAccount(credential, function(accountErrors, doc){
// 	// 			if(accountErrors && accountErrors.length > 0){
// 	// 				return rsp.json({'errors':accountErrors, 'token':'', 'decoded':''});
// 	// 			}else{
// 	// 				validateLoginPassword(credential, doc.password, function(passwordErrors){
// 	// 					var errors = accountErrors.concat(passwordErrors);
// 	// 					if(errors && errors.length > 0){
// 	// 						return rsp.json({'errors':errors, 'token': '', 'decoded':''});
// 	// 					}else{
// 	// 						var user = { id: doc._id, username: doc.username, 
// 	// 								//email: doc.email, 
// 	// 								role: doc.role, photo:doc.photo };
							
// 	// 						ut.signToken(user, function(token){	
// 	// 							delete user.email;
// 	// 							return rsp.json({'errors': errors, 'token': token, 'decoded': user});
// 	// 						});
// 	// 					}
// 	// 				});	
// 	// 			}
// 	// 		});
// 	// 	},
// 	// };
// }

// //var Statistic = require("../models/statistic");
// //var statistic_model = Statistic();
// var Validator = require('./validator');
// var v = Validator();
// var nodemailer = require("../../node_modules/nodemailer");
// var sgTransport = require('../../node_modules/nodemailer-sendgrid-transport');
// var crypto = require("crypto");
// var cfg = require('../config');

// var Parser = require('../query_parser');
// var parser = Parser();

// var Utils = require('./utils');
// var ut = Utils();
// var jwt = require("jsonwebtoken");


// var _us = require("../../node_modules/underscore/underscore-min");
// var DB = require('../db.js');
// //var Logger = require('../logger.js');

// module.exports = function(){
	
// 	var _name = 'users';
// 	var _db = new DB();
// 	var _collection = _db.getCollection(_name);
	
// 	var Error = {
// 			NONE:0,
// 			ACCOUNT_NOT_EXIST:1,
// 			PASSWORD_MISMATCH:2,
// 			ACCOUNT_EMPTY:3,
// 			EMAIL_EMPTY:4,
// 			INVALID_EMAIL:5,
// 			EMAIL_EXISTS:6,
// 			USERNAME_EMPTY:7,
// 			PASSWORD_EMPTY:8,
// 			PASSWORD_TOO_SIMPLE:9,
// 			ENCRYPT_PASSWORD_EXCEPTION:10,
// 			UPDATE_USER_EXCEPTION:11,
// 	}
	
	
// 	function sendResetPasswordMail(host, email, token, callback){
// 		var sg = cfg.sendgrid;
		
// 		var options = { auth: {
// 			api_user: sg.username,
// 			api_key: sg.password
// 		}};
		
// 		/*
// 		var options = { 
// 				service: 'Gmail',
// 				auth: {
// 					user: 'lik',
// 					pass: ''
// 				}};
// 		*/
		
// 		var transporter = nodemailer.createTransport( sgTransport(options));
// 		transporter.sendMail({
// 		    from: 'powerrent.service@gmail.com',
// 		    to: email,
// 		    subject: 'reset password of powerrent.ca',
// 		    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
// 	          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
// 	          'http://' + host + '/api/resetPassword?token=' + token + '\n\n' +
// 	          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
// 	      }, function(err){
// 				var doc = null;
// 				if(callback){
// 					callback(err, doc);
// 				}
// 	    });
// 	}
	
// 	// cb --- function( errors, doc );
// 	function validateLoginAccount(user, cb){
// 		var errors = [];
// 		var account = null;
		
// 		if (user.account.indexOf("@") != -1){
// 			account = {'email':user.account };
// 		}else{
// 			account = {'username':user.account};
// 		}
		
// 		if(user.account == ''){
// 			errors.push(Error.ACCOUNT_EMPTY);
// 			if(cb){
// 				cb(errors, null);
// 			}
// 		}else{
// 			_collection.findOne(account, function(err, doc){
// 				if( doc == null){
// 					errors.push(Error.ACCOUNT_NOT_EXIST);
// 				}
// 				if(cb){
// 					cb(errors, doc);
// 				}
// 			});
// 		}
// 	}
	
// 	// cb --- function(errors)
// 	function validateLoginPassword( user, hashedPassword, cb ){
// 		var errors = [];
// 		if( user.password ){
// 			ut.checkHash(user.password, hashedPassword, function(err, bMatch){
// 				if(!bMatch){
// 					errors.push(Error.PASSWORD_MISMATCH);
// 				}
// 				if(cb){
// 					cb(errors);
// 				}
// 			});
// 		}else{
// 			if(cb){
// 				cb(errors);
// 			}
// 		}
// 	}
	
// 	function isInvalidEmail(errors){
// 		return (errors.indexOf(Error.EMAIL_EMPTY)!==-1 || errors.indexOf(Error.INVALID_EMAIL)!==-1
// 				|| errors.indexOf(Error.EMAIL_EXISTS)!==-1);
// 	}
	
// 	function isInvalidUsername(errors){
// 		return errors.indexOf(Error.USERNAME_EMPTY)!=-1;
// 	}
	
// 	function validateSignup(user, cb){
// 		var errors = [];
		
// 		if(user.username == ''){
// 			errors.push(Error.USERNAME_EMPTY);
// 		}
		
// 		if(user.password == ''){
// 			errors.push(Error.PASSWORD_EMPTY);
// 		}else{
// 			if(v.passwordTooSimple(user.password)){
// 				errors.push(Error.PASSWORD_TOO_SIMPLE);
// 			}
// 		}
	
// 		if(user.email == ''){
// 			errors.push(Error.EMAIL_EMPTY);
// 		}else{
// 			if(!v.isEmail(user.email)){
// 				errors.push(Error.INVALID_EMAIL);
// 			}
// 		}
		
// 		// Check email and user name duplication
// 		if(isInvalidEmail(errors) && isInvalidUsername(errors)){
// 			if(cb)
// 				cb(errors);
// 		}else{
// 			_collection.findOne({$or: [{username:user.username}, {email:user.email}]}, function(err, doc){
// 				if(doc != null){
// 					if(user.username != '' && user.username == doc.username){
// 						errors.push(Error.USERNAME_EXISTS);
// 					}
					
// 					if(!isInvalidEmail(errors) && (user.email == doc.email)){
// 						errors.push(Error.EMAIL_EXISTS);
// 					}	
// 				}
				
// 				if(cb)
// 					cb(errors);
// 			});
// 		}
// 	}
	
// 	// Save user with hashed password
// 	function saveUser(user, errors, rsp){
// 		if(errors && errors.length > 0){
// 			rsp.json({'errors': errors, token: ''});
// 		}else{
// 			ut.hash(user.password, function(err, hash){
// 				if(hash){
// 					user.password = hash;
// 					_collection.save(user, function(err, doc){
// 						if(err){
// 							rsp.json({'errors': errors, 'token':''});
// 						}else{
// 							ut.signToken({'id': doc._id,'username': user.username, 'role':user.role, 'email':user.email}, function(token){
// 								rsp.json({'errors':errors, 'token': token});
// 							});
// 						}
// 					});
// 				}else{
// 					errors.push(Error.ENCRYPT_PASSWORD_EXCEPTION);
// 					rsp.json({'errors': errors, 'token': ''});
// 				}
// 			});
// 		}
// 	}
	
// 	return {
// 		renewToken: function(req, rsp){
// 			var token = req.body.token || req.query.token || req.headers['x-access-token'];
// 			ut.checkTokenV2(token, function(ret){
// 				if(ret.success){
// 					var a = ret.decoded;
// 					var obj = {id:a.id, username:a.username, email:a.email, role:a.role, photo:a.photo};
// 					ut.signToken(obj, function(token){
// 						ret.token = token;//ret --- {'success': false, 'message': 'Invalid token', decoded: '', token: ''}
// 						return rsp.json(ret);
// 					});
// 				}else{
// 					ret.token = '';//ret --- {'success': false, 'message': 'Invalid token', decoded: '', token: ''}
// 					return rsp.json(ret);
// 				}
// 			});
// 		},
		
		
// 		getAccount: function( req, rsp ){
// 			ut.renewToken(req, rsp, function(account, token){
// 				return rsp.json({success:true, 
// 					id:account.id, 
// 					username: account.username, 
// 					email: account.email, 
// 					photo: account.photo,
// 					'token': token});
// 			});
// 		},
		
		
		
// 		logout: function(req, res){
// 			if(req.session!=undefined){
// 				req.session['logged in'] = false;
// 			}
// 			res.json({success:true});
// 		},

// 		//--------------------------------------------------------------------------------------
// 		//	http post service, save new 
// 		//--------------------------------------------------------------------------------------
// 		save: function(req, rsp){
// 			var c = req.body;
// 			var user = { username: c.username,
// 						password:c.password,
// 						email:c.email,
// 						photo: c.photo,
// 						role:c.role,
// 						description: c.description,
// 						program: c.program,
// 						school: c.school,
// 						service: c.service
// 					};
			
// 			ut.hash(user.password, function(err, hash){
// 				if(hash){
// 					user.password = hash;
// 					_collection.save(user, function(err, doc){
// 						return rsp.json({ 'success': true, 'user': doc, error: null});
// 					});
// 				}
// 			}); // end of hash
// 		},
				
// 		get: function(req, rsp){
// 			//ut.checkToken(req, rsp, function(d){
// 				var query = req.body;
// 				_collection.find(query, function(err, docs){
					
// 					for(var i in docs){
// 						delete docs[i].email;
// 					}
					
// 					// password is hashed
// 					return rsp.json({ 'success': true, 'users': docs});
// 				});
// 			//})
// 		},
		
// 		getDetail: function(req, rsp){
// 			//ut.checkToken(req, rsp, function(d){
// 				_collection.findOne(req.body, function(err, doc){
// 					delete doc.email;
// 					return rsp.json({ 'success': true, 'user': doc});
// 				});
// 			//})
// 		},
		
// 		//--------------------------------------------------------------------------------------
// 		// The $set operator replaces the value of a field with the specified value.
// 		// Arguments:
// 		// req --- http req object with body.query and body.updates fields. if the req is from
// 		//	mobile phone, it's a json string, if it's from web, it's a json object
// 		//	eg. { body: { query:{_id:xxx}, updates: { $set:{status: 0, created:ISODate() }}}}
// 		// callback --- function(err, doc)
// 		//--------------------------------------------------------------------------------------
// 		updateOne: function(query, updates, callback){
// 			var keys = Object.keys(updates['$set']);
// 			if(keys.length != 0){
// 				if(keys.indexOf('password')!=-1){
// 					var passwd = updates['$set'].password;
// 					if(passwd){
// 						_collection.findOne(query, function(findErr, doc){
// 							if(doc){
// 								var encryptedPass = doc.password;
// 								ut.checkHash(passwd, encryptedPass, function(err, bMatch){
// 									if(!bMatch){ //User updated a new password
// 										ut.hash(passwd, function(err, encrypted){
// 											if(encrypted){
// 												updates['$set'].password = encrypted;
// 												// Arguments:
// 												// query 	--- { username, _id }
// 												// updates	--- The fields and values to be update, mongodb format: {$set:{k1:v1, k2:v2}
// 												_collection.update(query, updates, function(err, lastErrorObject){
// 													if(callback)
// 														callback(err);
// 												})
// 											}else{
// 												if(callback)
// 													callback(err);
// 											}
// 										}); // end of hash
// 									}else{ // password did not change
// 										_collection.update(query, updates, function(err, lastErrorObject){
// 											if(callback)
// 												callback(err);
// 										});
// 									}
// 								});// end of check hash
// 							}
// 						}); // end of findOne
// 					}else{ // password field is empty, keep existing password
// 						delete updates['$set'].password;
// 						_collection.update(query, updates, function(err, lastErrorObject){
// 							if(callback)
// 								callback(err);
// 						});
// 					}
// 				}else{
// 					// if there is no password field
// 					_collection.update(query, updates, function(err, lastErrorObject){
// 						if(callback)
// 							callback(err);
// 					})					
// 				}
// 			}else{
// 				// if there is no fields to update
// 			}
// 		},
		
// 		getPhoto: function(req, rsp){
// 			_collection.findOne({username:req.body.username}, function(err, doc){
// 				if(doc != null){
// 					return rsp.json({'success': true, 'photo': doc.photo});	
// 				}else{
// 					return rsp.json({'success': false, 'photo': ''});
// 				}
// 			});
// 		},
		
// 		getSessionID : function(req, res){
// 			res.json(req.sessionID);
// 		},

// 		getSession : function(req, res){
			
// //			if(req.session.userCount)
// //				req.session.userCount += 1;
// //			else
// //				req.session.userCount = 1;
			
// //			var d = new Date();
// //			var dt = d.setHours(0,0,0,0);
// //			var _ip = null;
// //			
// //			if(req.headers.hasOwnProperty('x-forwarded-for')){
// //				_ip = req.headers['x-forwarded-for'];
// //			}else{
// //				_ip = req.ip;
// //			}
// //			
// //			var visitor = {ip:_ip, recent_date:d.toISOString()};
// //			statistic_model.saveVisitor(visitor, function(errorCodes, doc){
// //				var a = null;
// //			});

// 			if(req.session==undefined){
// 				res.json({active:false});
// 			}else{
// 				res.json({active:req.session['logged in']});				
// 			}
// 		},
		
// 		//-------------------------------------------------------------------------
// 		// forgetPassword
// 		// Arguments:
// 		// 	host 	 --- server address, use req.head.host
// 		// 	username --- username for sign up
// 		// 	email 	 --- email address for sign up
// 		// callback  --- func(errors, Error, doc)
// 		//-------------------------------------------------------------------------
// 		forgetPassword: function(host, username, email, callback){
// 			crypto.randomBytes(20, function(err, buf) {
// 		          var token = buf.toString('hex');
		          
// 		          userModel.findOne({'username':username, 'email': email}, function(err, doc){
// 		        	  if(!doc){
// 		        		  if(callback){
// 		        			  //Logger.log('forget password, username and email does not match.');
// 		        			  callback('The email does not match', null);
// 		        		  }
// 		        	  }else{
// 				          userModel.updateOne({'email': email}, {'$set':{'token': token}}, function(error, item){
// 				        	  if(error){
// 				        		  if(callback){
// 				        			  callback(error, item);
// 				        		  }
// 				        	  }else{		        	  
// 				        		  sendResetPasswordMail(host, email, token, function(error, err){
// 					        		  if(callback){
// 					        			  callback(error, item);
// 					        		  }
// 						          }); 
// 				        	  }
// 				          });
// 		        	  }
// 		          });
// 		      });
// 		},
		
// 		//-------------------------------------------------------------------------
// 		// verifyToken
// 		// Arguments:
// 		// host --- server address, use req.head.host
// 		// callback --- func(errors, Error, doc)
// 		//-------------------------------------------------------------------------
// 		verifyToken: function(token, callback){
// 			userModel.findOne({'token': token}, callback);
// 			//User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {});
// 		},
		
// 		//-------------------------------------------------------------------------
// 		// resetPassword
// 		// Arguments:
// 		// token --- 
// 		// password ---
// 		// callback --- func(error, doc)
// 		//-------------------------------------------------------------------------
// 		resetPassword: function(token, password, callback){
// 			userModel.encryptPassword(password, function(err, hash){
// 				if(err){
// 					if(callback){
// 						callback(err);
// 					}
// 				}else{
// 					userModel.updateOne({'token': token}, {'$set':{'password': hash}}, callback);
// 				}
// 			});
// 		}
// 	}
// }

