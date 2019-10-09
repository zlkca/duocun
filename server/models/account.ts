import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import { Utils } from "../utils";
import { Entity } from "../entity";

const saltRounds = 10;

export interface IAccount {
  _id: string;
  type: string; // wechat, google, fb
  realm?: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  id?: string;
  password: string;
  sex?: string;
  openid?: string; // wechat openid
  imageurl?: string;
  unionid?: string; // wechat unionid
  accessTokens?: any[];
  // address?: IAddress;
  roles?: number[]; // 'super', 'merchant-admin', 'merchant-stuff', 'driver', 'user'
  visited?: boolean;
  stripeCustomerId?: string;
}

export class Account extends Model {
  balanceEntity: Entity;
  constructor(dbo: DB) {
    super(dbo, 'users');
    this.balanceEntity = new Entity(dbo, 'client_balances');
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
      
      this.findOne({username: credential.username}).then((r: IAccount) => {
        if(r != null){
          bcrypt.compare(credential.password, r.password, (err, matched) => {
            if(matched){
              res.setHeader('Content-Type', 'application/json');
              r.password = '';
              const cfg = new Config();
              const tokenId = jwt.sign(r._id.toString(), cfg.JWT.SECRET); // SHA256
              const token = {id: tokenId, ttl: 10000, userId: r._id.toString()};
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
              const id = account.id.toString();

              this.balanceEntity.find({ accountId: id }).then((x:any) => {
                if (!(x && x.length > 0)) {
                  this.balanceEntity.insertOne({
                    accountId: id,
                    accountName: account.username,
                    amount: 0,
                    created: new Date(),
                    modified: new Date()
                  }).then(() => { });
                }
              });

              account.password = '';
              const tokenId = jwt.sign(id, cfg.JWT.SECRET); // SHA256
              const token = {id: tokenId, ttl: 10000, userId: id};
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
              unionId: x.unionid,
              created: new Date(),
              modified: new Date()
            };
            this.insertOne(user).then(account => {
              const id = account.id.toString();
              this.balanceEntity.find({ accountId: id }).then((x:any) => {
                if (!(x && x.length > 0)) {
                  this.balanceEntity.insertOne({
                    accountId: id,
                    accountName: account.username,
                    amount: 0,
                    created: new Date(),
                    modified: new Date()
                  }).then(() => { 

                  });
                }else{

                }
              });
              account.password = '';
              const tokenId = jwt.sign(id, cfg.JWT.SECRET); // SHA256
              const token = {id: tokenId, ttl: 10000, userId: id};
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