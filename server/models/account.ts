import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "../db";
import { Entity } from "../entity";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import { Utils } from "../utils";

const saltRounds = 10;

export class Account extends Entity {
  constructor(dbo: DB) {
    super(dbo, 'users');
  }

  list(req: Request, res: Response) {
    let query = null;
    if(req.headers && req.headers.filter && typeof req.headers.filter === 'string'){
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    this.find(query ? query.where : {}).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(x, null, 3));
    });
  }

  get(req: Request, res: Response) {
    const id = req.params.id;
    if (id) {
      this.findOne({ _id: new ObjectID(id) }).then((r: any) => {
        if (r) {
          res.send(JSON.stringify(r, null, 3));
        } else {
          res.send(JSON.stringify(null, null, 3))
        }
      });
    }
  }

  create(req: Request, res: Response) {
    if (req.body.isArray()) {
      this.insertMany(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    } else {
      this.insertOne(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    }
  }

  replace(req: Request, res: Response) {

  }

  update(req: Request, res: Response) {
    this.updateOne(req.body.filter, req.body.data).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(x.result, null, 3)); // {n: 1, nModified: 1, ok: 1}
    });
  }

  remove(req: Request, res: Response) {

  }



	signup(req: Request, rsp: Response){
		const user = req.body;
    const dt = new Date();
    const self = this;
    user['created'] = dt.toISOString();
    user['type'] = 'user';
      this.findOne({username: user.username}).then((r: any) => {
        if(r != null){
          // validateSignup(user, function(errors){
          //self.saveUser(user, errors, rsp);
          // });
          return rsp.json(null);
        }else{
          bcrypt.hash(user.password, saltRounds, (err, hash) => {
            user['password'] = hash;
            self.insertOne(user).then(x => {
              x.password = '';
              return rsp.json(x);
            });
          });
        }
      });
  }

  // cb --- function(errors)
	// validateLoginPassword( user, hashedPassword, cb ){
	// 	const errors = [];
	// 	if( user.password ){
	// 		ut.checkHash(user.password, hashedPassword, function(err, bMatch){
	// 			if(!bMatch){
	// 				errors.push(Error.PASSWORD_MISMATCH);
	// 			}
	// 			if(cb){
	// 				cb(errors);
	// 			}
	// 		});
	// 	}else{
	// 		if(cb){
	// 			cb(errors);
	// 		}
	// 	}
	// }

  	login(req: Request, res: Response){
      const self = this;
      const credential = {username: req.body.username, password: req.body.password};
      
      this.findOne({username: credential.username}).then((r: any) => {
        if(r != null){
          bcrypt.compare(credential.password, r.password, (err, matched) => {
            if(matched){
              res.setHeader('Content-Type', 'application/json');
              r.password = '';
              const cfg = new Config();
              const tokenId = jwt.sign(r, cfg.JWT.SECRET); // SHA256
              const token = {id: tokenId, ttl: 10000, userId: r.id};
              res.send(JSON.stringify(token, null, 3));
            }else{
              res.send(JSON.stringify(null, null, 3));
            }
          });
        }else{
          return res.json({'errors': [], 'token': 'token', 'decoded': 'user'});
        }
      });
    }
	// 		validateLoginAccount(credential, function(accountErrors, doc){
	// 			if(accountErrors && accountErrors.length > 0){
	// 				return rsp.json({'errors':accountErrors, 'token':'', 'decoded':''});
	// 			}else{
	// 				validateLoginPassword(credential, doc.password, function(passwordErrors){
	// 					var errors = accountErrors.concat(passwordErrors);
	// 					if(errors && errors.length > 0){
	// 						return rsp.json({'errors':errors, 'token': '', 'decoded':''});
	// 					}else{
	// 						var user = { id: doc._id, username: doc.username, 
	// 								//email: doc.email, 
	// 								role: doc.role, photo:doc.photo };
							
	// 						ut.signToken(user, function(token){	
	// 							delete user.email;
	// 							return rsp.json({'errors': errors, 'token': token, 'decoded': user});
	// 						});
	// 					}
	// 				});	
	// 			}
	// 		});
	// 	},
  // };
  

  wechatLogin(req: Request, res: Response){
    const utils = new Utils();
    const cfg = new Config();
    const authCode = req.query.code;
    utils.getWechatAccessToken(authCode).then((ret: any) => {
      utils.getWechatUserInfo(ret.access_token, ret.openid).then((x: any) => {
        this.findOne({openId: ret.openid}).then((r: any) => {
          if(r){
            r.username = x.nickname;
            r.imageurl = x.headimgurl;
            r.address.city = x.city;
            r.address.province = x.province;
            r.address.country = x.country;

            this.replaceById(r.id, r).then(account => {
              account.password = '';
              const tokenId = jwt.sign(account, cfg.JWT.SECRET); // SHA256
              const token = {id: tokenId, ttl: 10000, userId: account.id};
              res.send(JSON.stringify(token, null, 3));
            }, err => {
              console.log(err);
            });
          }else{
            const user = {
              type: 'user',
              username: x.nickname,
              address: {city: x.city, province: x.province, country: x.country},
              imageurl: x.headimgurl,
              realm: 'wechat',
              openId: x.openid,
              unionId: x.unionid
            };
            this.insertOne(user).then(account => {
              account.password = '';
              const tokenId = jwt.sign(account, cfg.JWT.SECRET); // SHA256
              const token = {id: tokenId, ttl: 10000, userId: account.id};
              res.send(JSON.stringify(token, null, 3));
            }, err => {
              console.log(err);
            });
          }
        }, err => {
          console.log(err);
        });
      }, err => {
        console.log(err);
      });
    }, err => {
      console.log(err);
      res.send();
    });
  }
}