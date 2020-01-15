import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import { Utils } from "../utils";
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
  verificationCode: string;
  verified: boolean;

  info?: string;  // client info
}

export class Account extends Model {
  cfg: Config;
  twilioClient: any;

  constructor(dbo: DB) {
    super(dbo, 'users');
    this.cfg = new Config();// JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
    this.twilioClient = require('twilio')(this.cfg.TWILIO.SID, this.cfg.TWILIO.TOKEN);
  }

  trySignup(accountId: string, rawPhone: any): Promise<any> {
    const d1 = Math.floor(Math.random() * 10).toString();
    const d2 = Math.floor(Math.random() * 10).toString();
    const d3 = Math.floor(Math.random() * 10).toString();
    const d4 = Math.floor(Math.random() * 10).toString();
    const code: string = (d1 + d2 + d3 + d4).toString();

    let phone = rawPhone.substring(0, 2) === '+1' ? rawPhone.substring(2) : rawPhone;
    phone = phone.match(/\d+/g).join('');

    return new Promise((resolve, reject) => {
      this.findOne({ phone: phone }).then((account: IAccount) => {
        if (account) { // phone number unchange, verification code could change
          const data = { phone: phone, verificationCode: code };
          this.updateOne({ _id: account._id.toString() }, data).then((r) => {
            if (r.ok === 1) {
              resolve({ accountId: account._id.toString(), phone: phone, verificationCode: code });
            } else {
              resolve({ accountId: '', phone: phone, verificationCode: code }); // fix me
            }
          });
        } else {
          if (accountId) { // account exist, change account phone number
            const data = { phone: phone, verificationCode: code, verified: false };
            this.updateOne({ _id: accountId }, data).then((r) => {
              if (r.ok === 1) {
                resolve({ accountId: accountId, phone: phone, verificationCode: code });
              } else {
                resolve({ accountId: '', phone: phone, verificationCode: code });
              }
            });
          } else { // account and phone number do not exist, create temp account
            // bcrypt.hash(password, saltRounds, (err, hash) => {
            //   data['password'] = hash;
            const data = {
              username: phone,
              phone: phone,
              type: 'tmp', // tmp user are those verified phone but did not signup under agreement
              balance: 0,
              verificationCode: code,
              verified: false,
              created: moment().toISOString()
            };
            this.insertOne(data).then((x: IAccount) => {
              resolve({ accountId: x._id.toString(), phone: phone, verificationCode: code });
            });
            // });
          }
        }
      });
    });
  }

  // req --- require accountId, username and phone fields
  sendVerifyMsg(req: Request, res: Response) {
    const self = this;
    const lang = req.body.lang;

    this.trySignup(req.body.accountId, req.body.phone).then((r: any) => {
      if (r) {
        self.twilioClient.messages.create({
            body: (lang === 'en' ? 'Duocun Verification Code: ' : '多村外卖验证码: ') + r.verificationCode,
            from: '+16475591743',
            to: "+1".concat(r.phone)
          })
        .then((message: any) => {
            // console.log(message.sid);
          const cfg = new Config();
          const tokenId = jwt.sign(r.accountId, cfg.JWT.SECRET); // SHA256
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(tokenId, null, 3));
        });
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify('', null, 3));
      }
    });
  }

  doVerifyPhone(phone: string, code: string) {
    return new Promise((resolve, reject) => {
      this.findOne({ phone: phone }).then(a => {
        if (a) {
          const verified = a && a.verificationCode.toString() === code;
          this.updateOne({ _id: a._id.toString() }, { verified: verified }).then((result) => {
            resolve(verified);
          });
        } else {
          resolve(false);
        }
      });
    });
  }

  verifyCode(req: Request, res: Response) {
    const phone = req.body.phone;
    let code = req.body.code;
    this.doVerifyPhone(phone, code).then((verified) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(verified, null, 3));
    });
  }

  list(req: Request, res: Response) {
    let query = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    query = this.convertIdFields(query);
    this.find(query).then(accounts => {
      accounts.map((account: any) => {
        delete account.password;
      });

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(accounts, null, 3));
    });
  }


  getCurrentAccount(req: Request, res: Response) {
    const tokenId: string = req.query.tokenId;

    this.getAccountByToken(tokenId).then(account => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(account, null, 3));
    });
  }

  // To do: test token is undefined or null
  getAccountByToken(tokenId: string): Promise<IAccount> {
    const cfg = new Config();

    return new Promise((resolve, reject) => {
      if(tokenId && tokenId !== 'undefined' && tokenId !== 'null'){
        const accountId = jwt.verify(tokenId, cfg.JWT.SECRET);
        if (accountId) {
          this.findOne({ _id: accountId }).then((account: IAccount) => {
            if (account) {
              delete account.password;
            }
            resolve(account);
          });
        } else {
          resolve();
        }
      }else{
        resolve();
      }
    });
  }

  signup(req: Request, res: Response) {
    const phone = req.body.phone.toString();
    const code: string = req.body.verificationCode.toString();

    this.doSignup(phone, code).then((account: any) => {
      res.setHeader('Content-Type', 'application/json');

      const cfg = new Config();
      const tokenId = jwt.sign(account._id.toString(), cfg.JWT.SECRET); // SHA256
      res.send(JSON.stringify(tokenId, null, 3));
    });
  }

  createTmpAccount(phone: string, verificationCode: string): Promise<IAccount> {
    return new Promise((resolve, reject) => {

    });
  }

  // There are two senarios for signup.
  // 1. after user verified phone number, there is a button for signup. For this senario, phone number and verification code are mandatory
  // 2. when user login from 3rd party, eg. from wechat, it will do signup. For this senario, wechat openid is mandaroty.
  // only allow to signup with phone number and verification code (password)
  doSignup(phone: string, verificationCode: string): Promise<IAccount> {
    return new Promise((resolve, reject) => {
      if (phone) {
        this.findOne({ phone: phone }).then((x: IAccount) => {
          if (x) {
            // bcrypt.hash(password, saltRounds, (err, hash) => {
            const updates = { phone: phone, verificationCode: verificationCode, type: 'client' };
            this.updateOne({ _id: x._id.toString() }, updates).then(() => {
              delete x.password;
              x = { ...x, ...updates };
              resolve(x);
            });
            // });
          } else { // should not go here
            const data = {
              username: phone,
              phone: phone,
              type: 'client', // tmp user are those verified phone but did not signup under agreement
              balance: 0,
              verificationCode: verificationCode,
              verified: false,
              created: moment().toISOString()
            };
            this.insertOne(data).then((x: IAccount) => {
              resolve(x);
            });
          }
        });
      } else {
        resolve();
      }
    });
  }

  // When user login from 3rd party, eg. from wechat, it will do signup. For this senario, wechat openid is mandaroty.
  doWechatSignup(openId: string, username: string, imageurl: string, sex: number): Promise<IAccount> {
    return new Promise((resolve, reject) => {
      if (openId) {
        this.findOne({ openId: openId }).then((x: IAccount) => {
          if (x) {
            const updates = {
              username: username,
              imageurl: imageurl,
              sex: sex
            };
            this.updateOne({ _id: x._id.toString() }, updates).then(() => {
              delete x.password;
              x = { ...x, ...updates };
              resolve(x);
            });
          } else {
            const data = {
              username: username,
              imageurl: imageurl,
              sex: sex,
              type: 'user',
              realm: 'wechat',
              openId: openId,
              // unionId: x.unionid, // not be able to get wechat unionId
              balance: 0,
              created: moment().toISOString(),
            };
            this.insertOne(data).then((x: IAccount) => {
              delete x.password;
              resolve(x);
            });
          }
        });
      } else {
        resolve();
      }
    });
  }

  // --------------------------------------------------------------------------------------------------
  // wechat, google or facebook can not use this request to login
  // phone    ---  unique phone number, verification code as password by default
  doLoginByPhone(phone: string, verificationCode: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const query = { phone: phone };
      this.findOne(query).then((r: IAccount) => {
        if (r && r.verificationCode) {
          if (r.verificationCode === verificationCode) {
            const cfg = new Config();
            const tokenId = jwt.sign(r._id.toString(), cfg.JWT.SECRET); // SHA256
            resolve(tokenId);
          } else {
            resolve();
          }
        } else {
          return resolve();
        }
      });
    });
  }

  // --------------------------------------------------------------------------------------------------
  // wechat, google or facebook can not use this request to login
  // username --- optional, can be null, unique  username
  // password --- mandadory field
  doLogin(username: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let query = null;
      if (username) {
        query = { username: username };
      }

      if (query) {
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
      } else {
        resolve();
      }
    });
  }

  loginByPhone(req: Request, res: Response) {
    const phone = req.body.phone;
    const verificationCode = req.body.verificationCode;

    this.doLoginByPhone(phone, verificationCode).then((tokenId: string) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(tokenId, null, 3));
    });
  }

  login(req: Request, res: Response) {
    const username = req.body.username;
    const password = req.body.password;

    this.doLogin(username, password).then((tokenId: string) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(tokenId, null, 3));
    });
  }

  wechatLogin(req: Request, res: Response) {
    const utils = new Utils();
    const cfg = new Config();
    const authCode = req.query.code;
    utils.getWechatAccessToken(authCode).then((r: any) => {
      utils.getWechatUserInfo(r.access_token, r.openid).then((x: any) => { // IAccount
        // try find
        this.doWechatSignup(x.openid, x.nickname, x.headimgurl, x.sex).then((account: IAccount) => {
          if (account) {
            const accountId = account._id.toString();
            const tokenId = jwt.sign(accountId, cfg.JWT.SECRET); // SHA256
            res.send(JSON.stringify(tokenId, null, 3));
          } else {
            res.send(JSON.stringify('', null, 3));
          }
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




  // getMyBalanceForRemoveOrder(balance: number, paymentMethod: string, payable: number) {
  //   if (paymentMethod === 'prepaid' || paymentMethod === 'cash') {
  //     return Math.round((balance + payable) * 100) / 100;
  //   } else if (paymentMethod === 'card' || paymentMethod === 'WECHATPAY') {
  //     return Math.round((balance + payable) * 100) / 100;
  //   } else {
  //     return null; // no need to update balance
  //   }
  // }

  // deprecated
  // updateMyBalanceForRemoveOrder(order: any): Promise<any> {
  //   const clientId = order.clientId;
  //   return new Promise((resolve, reject) => {
  //     this.find({ _id: clientId }).then((accounts: any[]) => {
  //       if (accounts && accounts.length > 0) {
  //         const balance = accounts[0].balance;
  //         const newAmount = this.getMyBalanceForRemoveOrder(balance, order.paymentMethod, order.total);
  //         if (newAmount === null) {
  //           resolve(null);
  //         } else {
  //           this.updateOne({ _id: clientId }, { amount: newAmount }).then(x => { // fix me
  //             resolve(x);
  //           });
  //         }
  //       } else {
  //         resolve(null);
  //       }
  //     });
  //   });
  // }

  // updateMyBalanceForAddOrder(clientId: string, paid: number): Promise<any> {
  //   const self = this;
  //   return new Promise((resolve, reject) => {
  //     this.find({ _id: clientId }).then((accounts: any[]) => {
  //       if (accounts && accounts.length > 0) {
  //         const balance = accounts[0].balance;
  //         const newAmount = Math.round((balance + paid) * 100) / 100;
  //         // const newAmount = this.getMyBalanceForAddOrder(balance.amount, order.paymentMethod, order.paymentStatus === PaymentStatus.PAID, order.total, paid);
  //         if (newAmount === null) {
  //           resolve(null);
  //         } else {
  //           this.updateOne({ _id: clientId }, { amount: newAmount, ordered: true }).then(x => {
  //             resolve(x);
  //           });
  //         }
  //       } else {
  //         resolve(null);
  //       }
  //     });
  //   });
  // }
}