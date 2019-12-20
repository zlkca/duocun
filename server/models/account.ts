import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import { Utils } from "../utils";
// import { Contact } from "./contact";
import moment from 'moment';
import { resolve } from "../../node_modules/@types/q";

const saltRounds = 10;

export interface IAccount {
  _id: string;
  type: string; // wechat, google, fb
  realm?: string;
  username: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  id?: string;
  password?: string;

  openId?: string;    // wechat info
  sex?: number;       // wechat info
  openid?: string;    // wechat openid
  imageurl?: string;  // wechat imageurl
  unionid?: string;   // wechat unionid
  accessTokens?: any[];
  // address?: IAddress;
  roles?: number[];   // 'super', 'merchant-admin', 'merchant-stuff', 'driver', 'user'
  visited?: boolean;
  stripeCustomerId?: string;
  pickup: string;
  balance: number;
}

export class Account extends Model {
  // private contactModel: Contact;
  constructor(dbo: DB) {
    super(dbo, 'users');
    // this.contactModel = new Contact(dbo);
  }

  list(req: Request, res: Response) {
    let query = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    query = this.convertIdFields(query);
    // this.contactModel.find({}).then((cs: any[]) => {
      this.find(query).then(accounts => {
        accounts.map((account: any) => {
          delete account.password;
          // account.contact = cs.find((c: any) => c.accountId.toString() === account._id.toString());
        });

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(accounts, null, 3));
      });
    // });
  }


  getCurrentAccount(req: Request, res: Response) {
    const tokenId: string = req.query.tokenId;
    const cfg = new Config();
    const accountId = jwt.verify(tokenId, cfg.JWT.SECRET);
    if(accountId){
      this.findOne({_id: accountId}).then(account => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(account, null, 3));
      });
    }
  }

  signup(req: Request, res: Response) {
    const phone = req.body.phone;
    const username = req.body.username;
    const password = req.body.password;
    const type = req.body.type;
    const _id = req.body._id; // optional

    this.doSignup(_id, type, username, phone, password).then((account: any) => {
      res.setHeader('Content-Type', 'application/json');

      const cfg = new Config();
      const tokenId = jwt.sign(account._id.toString(), cfg.JWT.SECRET); // SHA256
      res.send(JSON.stringify(tokenId, null, 3));
    });
  }

  doSignup(accountId: string, type: string, username: string, phone: string, password: string): Promise<IAccount>{
    const data = accountId ? {
      _id: accountId,
      username: username,
      phone: phone,
      type: type,
      password: '',
      balance: 0,
      created: moment().toISOString()
    } : {
      username: username,
      phone: phone,
      type: type,
      password: '',
      balance: 0,
      created: moment().toISOString()
    };

    return new Promise((resolve, reject) => {
      if(accountId){
        bcrypt.hash(password, saltRounds, (err, hash) => {
          data['password'] = hash;
          this.insertOne(data).then(x => {
            x.password = '';
            resolve(x);
          });
        });
      }else{
        this.findOne({phone: phone}).then(x => {
          if(x){
            resolve();
          }else{
            bcrypt.hash(password, saltRounds, (err, hash) => {
              data['password'] = hash;
              this.insertOne(data).then(x => {
                x.password = '';
                resolve(x);
              });
            });
          }
        })
      }
    });
  }


  // --------------------------------------------------------------------------------------------------
  // wechat, google or facebook can not use this request to login
  // username --- optional, can be null, unique  username
  // phone    --- optional, can be null, unique phone number, verification code as password by default
  // password --- mandadory field
  doLogin(username: string, phone: string, password: string): Promise<string> {
    return new Promise( (resolve, reject) => {
      let query = null;
      if(username){
        query = { username: username };
      }else if(phone){
        query = { phone: phone };
      }
      
      if(query){
        this.findOne(query).then((r: IAccount) => {
          if (r && r.password) {
            bcrypt.compare(password, r.password, (err, matched) => {
              if (matched) {
                r.password = '';
                const cfg = new Config();
                const tokenId = jwt.sign(r._id.toString(), cfg.JWT.SECRET); // SHA256
                resolve(tokenId);
              } else {
                resolve();
              }
            });
          } else {
            return resolve();
          }
        });
      }else{
        resolve();
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

  login(req: Request, res: Response) {
    const username = req.body.username;
    const phone = req.body.phone;
    const password = req.body.password;

    this.doLogin(username, phone, password).then((tokenId: string) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(tokenId, null, 3));
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

  wechatLogin(req: Request, res: Response) {
    const utils = new Utils();
    const cfg = new Config();
    const authCode = req.query.code;
    utils.getWechatAccessToken(authCode).then((ret: any) => {
      utils.getWechatUserInfo(ret.access_token, ret.openid).then((x: any) => { // IAccount
        this.findOne({ openId: ret.openid }).then((r: IAccount) => {
          if (r) {
            // update latest wechat info into account
            const updates = {
              username: x.nickname,
              imageurl: x.headimgurl,
              sex: x.sex
            };
            const accountId = r._id.toString();
            this.updateOne({ _id: accountId }, updates).then(() => {
              const tokenId = jwt.sign(accountId, cfg.JWT.SECRET); // SHA256
              res.send(JSON.stringify(tokenId, null, 3));
            }, err => {
              console.log(err);
              res.send(JSON.stringify('', null, 3));
            });
          } else {
            const user = {
              type: 'user',
              username: x.nickname,
              imageurl: x.headimgurl,
              sex: x.sex,
              realm: 'wechat',
              openId: x.openid,
              // unionId: x.unionid, // not be able to get wechat unionId
              balance: 0
            };
            this.insertOne(user).then(account => {
              const accountId = account._id.toString();
              const tokenId = jwt.sign(accountId, cfg.JWT.SECRET); // SHA256
              res.send(JSON.stringify(tokenId, null, 3));
            }, err => {
              console.log(err);
              res.send(JSON.stringify('', null, 3));
            });
          }
        }, err => {
          console.log(err);
          res.send(JSON.stringify('', null, 3));
        });
      }, err => {
        console.log(err);
        res.send(JSON.stringify('', null, 3));
      });
    }, err => {
      console.log(err);
      res.send(JSON.stringify('', null, 3));
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

  // deprecated
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