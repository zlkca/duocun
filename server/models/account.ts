import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import { Utils } from "../utils";
import { Entity } from "../entity";
import { ObjectID } from "mongodb";

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
  pickup: string;
  balance: number;
}

export class Account extends Model {
  constructor(dbo: DB) {
    super(dbo, 'users');
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

  // getById(req: Request, res: Response){
  //   const id = req.body._id;
  //   if(id){
  //     const q = {_id: new ObjectID(id)};
  //     this.findOne(q).then((r: IAccount) => {
  //       if(r != null){
  //         res.setHeader('Content-Type', 'application/json');
  //         r.password = '';
  //         const cfg = new Config();
  //         const tokenId = jwt.sign(r._id.toString(), cfg.JWT.SECRET); // SHA256
  //         const token = {id: tokenId, ttl: 10000, userId: r._id.toString()};
  //         res.send(JSON.stringify(token, null, 3));
  //       }else{
  //         return res.json({'errors': [], 'token': 'token', 'decoded': 'user'});
  //       }
  //     });
  //   }else{
  //     return res.json({'errors': [], 'token': 'token', 'decoded': 'user'});
  //   }
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
              balance: 0
            };
            this.insertOne(user).then(account => {
              const id = account.id.toString();
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


  getMyBalanceForRemoveOrder(balance: number, paymentMethod: string, payable: number) {
    if (paymentMethod === 'prepaid' || paymentMethod === 'cash') {
      return Math.round((balance + payable) * 100) / 100;
    } else if (paymentMethod === 'card' || paymentMethod === 'WECHATPAY') {
      return Math.round((balance + payable) * 100) / 100;
    } else {
      return null; // no need to update balance
    }
  }

  updateMyBalanceForRemoveOrder(order: any): Promise<any> {
    const clientId = order.clientId;
    return new Promise((resolve, reject) => {
      this.find({ _id: clientId }).then((accounts: any[]) => {
        if (accounts && accounts.length > 0) {
          const balance = accounts[0].balance;
          const newAmount = this.getMyBalanceForRemoveOrder(balance, order.paymentMethod, order.total);
          if (newAmount === null) {
            resolve(null);
          } else {
            this.updateOne({ _id: clientId }, { amount: newAmount }).then(x => { // fix me
              resolve(x);
            });
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  updateMyBalanceForAddOrder(clientId: string, paid: number): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      this.find({ _id: clientId }).then((accounts: any[]) => {
        if (accounts && accounts.length > 0) {
          const balance = accounts[0].balance;
          const newAmount = Math.round((balance + paid) * 100) / 100;
          // const newAmount = this.getMyBalanceForAddOrder(balance.amount, order.paymentMethod, order.status === 'paid', order.total, paid);
          if (newAmount === null) {
            resolve(null);
          } else {
            this.updateOne({ _id: clientId }, { amount: newAmount, ordered: true }).then(x => {
              resolve(x);
            });
          }
        } else {
          resolve(null);
        }
      });
    });
  }
}