
import { DB } from "../db";
import { Model } from "./model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import { Utils } from "../utils";
import moment from 'moment';
import { resolve } from "dns";

const saltRounds = 10;
export const VerificationError = {
  NONE: 'N',
  WRONG_CODE: 'WC',
  PHONE_NUMBER_OCCUPIED: 'PO',
  REQUIRE_SIGNUP: 'RS',
  NO_PHONE_NUMBER_BIND: 'NP'
}

export const AccountType = {
  TEMP: 'tmp'
}

export enum Role {
  SUPER = 1,
  MERCHANT_ADMIN = 2,
  MERCHANT_STUFF = 3,
  MANAGER = 4,
  DRIVER = 5,
  CLIENT = 6
}

export interface IAccountAttribute {
  _id?: string;
  code: string; //   I: INDOOR, G: GARDENING, R: ROOFING, O: OFFICE, P: PLAZA, H: HOUSE, C: CONDO
  name: string;
  nameEN?: string;
}

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

  attributes?: string[]; // IAccountAttribute's code, I: INDOOR, G: GARDENING, R: ROOFING, O: OFFICE, P: PLAZA, H: HOUSE, C: CONDO
  info?: string;  // client info

  merchants?: string[]; // only merchant account have this field
}

export class AccountAttribute extends Model {
  constructor(dbo: DB) {
    super(dbo, 'user_attributes');
  }
}

export class Account extends Model {
  cfg: Config;
  twilioClient: any;

  constructor(dbo: DB) {
    super(dbo, 'users');
    this.cfg = new Config();// JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
    this.twilioClient = require('twilio')(this.cfg.TWILIO.SID, this.cfg.TWILIO.TOKEN);
  }

  jwtSign(accountId: string) {
    return jwt.sign(accountId, this.cfg.JWT.SECRET); // SHA256
  }

  // return message
  async sendMessage(phone: string, text: string) {
    return await this.twilioClient.messages.create({
      body: text,
      from: '+16475591743',
      to: "+1".concat(phone)
    });
  }

  // self.twilioClient.messages.create({
  //   body: txt,
  //   from: '+16475591743',
  //   to: "+1".concat(phone)
  // })
  //   .then((message: any) => {
  //     res.send(JSON.stringify('', null, 3)); // sign up fail, please contact admin
  //   });

  getRandomCode() {
    const d1 = Math.floor(Math.random() * 10).toString();
    const d2 = Math.floor(Math.random() * 10).toString();
    const d3 = Math.floor(Math.random() * 10).toString();
    const d4 = Math.floor(Math.random() * 10).toString();
    return (d1 + d2 + d3 + d4).toString();
  }

  async trySignupV2(accountId: string, rawPhone: any) {
    if (!accountId && !rawPhone) { // doesn't have phone and account
      return { accountId: '', phone: '', verificationCode: '', verified: false };
    } else if (!rawPhone && accountId) { // has account
      const x = await this.findOne({ _id: accountId });
      if (x && x.phone) {
        const code = this.getRandomCode();
        return { accountId, phone: x.phone, verificationCode: code, verified: false };
      } else {
        return { accountId, phone: '', verificationCode: '', verified: false };
      }
    } else if (rawPhone && !accountId) { // has phone and no account
      const code = this.getRandomCode();
      let phone = rawPhone.substring(0, 2) === '+1' ? rawPhone.substring(2) : rawPhone;
      phone = phone.match(/\d+/g).join('');
      const data = {
        username: phone,
        type: 'client', // tmp user are those verified phone but did not signup under agreement
        balance: 0,
        phone,
        verificationCode: code,
        verified: false,
        attributes: [],
        created: moment().toISOString()
      };
      await this.insertOne(data);
      const x = await this.findOne({ phone });
      return { accountId: x._id.toString(), phone: phone, verificationCode: code, verified: false };
    } else { // has both phone and account
      const code = this.getRandomCode();
      let phone = rawPhone.substring(0, 2) === '+1' ? rawPhone.substring(2) : rawPhone;
      phone = phone.match(/\d+/g).join('');
      const occupiedAccount = await this.findOne({ phone });
      if (occupiedAccount) {
        const data = { phone, verificationCode: code };
        await this.updateOne({ _id: occupiedAccount._id.toString() }, data); // replace with new phone number & code
        return { accountId: occupiedAccount._id.toString(), phone, verificationCode: code, verified: false };
      } else { // use existing account
        const account = await this.findOne({ _id: accountId });
        return { accountId: account._id.toString(), phone: phone, verificationCode: code, verified: false };
      }
    }
  }

  // try signup an account with phone number.
  // If this phone number is already used by an account, return that account.
  // Otherwise:
  // If user already login, and the phone number did not use, associate the phone number.
  // If use did not login, create a new account with this phone number. 
  //    --- if ok {accountId:x, phone: phone}, else {accountId:'', phone}
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
              resolve({ accountId: '', phone: phone, verificationCode: code }); // update fail, should not happen
            }
          });
        } else {
          if (accountId) { // account exist, change account phone number
            const data = { phone: phone, verificationCode: code, verified: false };
            this.updateOne({ _id: accountId }, data).then((r) => {
              if (r.ok === 1) {
                resolve({ accountId: accountId, phone: phone, verificationCode: code });
              } else {
                resolve({ accountId: '', phone: phone, verificationCode: code }); // update fail, should not happen
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
              attributes: [],
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




  // sendClientMsg2(req: Request, res: Response) {
  //   const self = this;
  //   const text = req.body.text;
  //   const phone = req.body.phone;
  //   const orderType = req.body.orderType;

  //   res.setHeader('Content-Type', 'application/json');

  //   let txt = '多村送菜提醒您: 您的收货地址缺少街道名或门牌号, 请把完整的收货地址发到 416-906-5468, 谢谢！';
  //   self.twilioClient.messages.create({
  //     body: txt,
  //     from: '+16475591743',
  //     to: "+1".concat(phone)
  //   })
  //     .then((message: any) => {
  //       res.send(JSON.stringify('', null, 3)); // sign up fail, please contact admin
  //     });
  // }

  // result --- result from verify()
  async updateAccountVerified(result: any) {
    const verified = result.verified;
    if (verified) {
      const account = result.account;
      const accountId = account._id.toString();
      await this.updateOne({ _id: accountId }, { verified });
      const cfg = new Config();
      const tokenId = jwt.sign(accountId, cfg.JWT.SECRET); // SHA256
      return { ...result, tokenId: tokenId };
    } else {
      return { ...result, tokenId: null };
    }
  }

  verifyPhoneNumber(phone: string, code: string, loggedInAccountId: string) {
    return new Promise((resolve, reject) => {
      const cfg = new Config();
      
      this.findOne({ phone }).then((account) => {
        if (account && account.password) {
          delete account.password;
        }
        if (loggedInAccountId) {
          if (account) { // phone has account
            if (account._id.toString() !== loggedInAccountId) {
              resolve({ verified: false, err: VerificationError.PHONE_NUMBER_OCCUPIED, account });
            } else {
              if (account.verificationCode && (code === account.verificationCode)) {
                const tokenId = jwt.sign(account._id.toString(), cfg.JWT.SECRET); // SHA256
                resolve({ verified: true, err: VerificationError.NONE, account, tokenId });
              } else {
                resolve({ verified: false, err: VerificationError.WRONG_CODE, account });
              }
            }
          } else {
            const tokenId = jwt.sign(loggedInAccountId, cfg.JWT.SECRET); // SHA256
            resolve({ verified: true, err: VerificationError.NONE, account, tokenId }); // please resend code
          }
        } else { // enter from web page 
          if (account) {
            if (account.openId) {
              resolve( { verified: false, err: VerificationError.PHONE_NUMBER_OCCUPIED, account });
            } else {
              if (account.verificationCode && code === account.verificationCode) {
                const tokenId = jwt.sign(account._id.toString(), cfg.JWT.SECRET); // SHA256
                resolve( { verified: true, err: VerificationError.NONE, account, tokenId }); // tokenId: tokenId, 
              } else {
                resolve( { verified: false, err: VerificationError.WRONG_CODE, account });
              }
            }
          } else {
            resolve( { verified: false, err: VerificationError.NO_PHONE_NUMBER_BIND, account }); // // please resend code
          }
        }
      });
    });
  }


  doVerifyAndLogin(phone: string, code: string, loggedInAccountId: string) {
    return new Promise((resolve, reject) => {
      if (loggedInAccountId) { // logged in
        this.findOne({ phone }).then((account: IAccount) => {
          if (account) { // phone has an account
            if (account._id.toString() !== loggedInAccountId) {
              resolve({ verified: false, err: VerificationError.PHONE_NUMBER_OCCUPIED });
            } else {
              if (account.verificationCode && code === account.verificationCode) {
                if (account.password) {
                  delete account.password;
                }
                account.verified = true;
                this.updateOne({ _id: account._id }, { verified: true }).then(() => {
                  if (account.type === AccountType.TEMP) {
                    resolve({ verified: true, err: VerificationError.REQUIRE_SIGNUP, account: account });
                  } else {
                    resolve({ verified: true, err: VerificationError.NONE, account: account });
                  }
                });
              } else {
                resolve({ verified: false, err: VerificationError.WRONG_CODE });
              }
            }
          } else {
            // resolve({ verified: false, err: VerificationError.NO_PHONE_NUMBER_BIND });
            resolve({ verified: true, err: VerificationError.NONE, account: account });
          }
        });
      } else { // loggedInAccountId = ''
        this.findOne({ phone: phone }).then(account => {
          if (account) {
            if (account.type === AccountType.TEMP) {
              if (account.verificationCode && code === account.verificationCode) {
                if (account.password) {
                  delete account.password;
                }
                account.verified = true;
                this.updateOne({ _id: account._id }, { verified: true }).then(() => {
                  resolve({ verified: true, err: VerificationError.REQUIRE_SIGNUP, account: account });
                });
              } else {
                resolve({ verified: false, err: VerificationError.WRONG_CODE });
              }
            } else {
              if (account.openId) {
                resolve({ verified: false, err: VerificationError.PHONE_NUMBER_OCCUPIED });
              } else {
                if (account.verificationCode && code === account.verificationCode) {
                  const cfg = new Config();
                  const tokenId = jwt.sign(account._id.toString(), cfg.JWT.SECRET); // SHA256
                  if (account.password) {
                    delete account.password;
                  }
                  account.verified = true;
                  this.updateOne({ _id: account._id }, { verified: true }).then(() => {
                    resolve({ verified: true, err: VerificationError.NONE, tokenId: tokenId, account: account });
                  });
                } else {
                  resolve({ verified: false, err: VerificationError.WRONG_CODE });
                }
              }
            }
          } else {
            resolve({ verified: false, err: VerificationError.NO_PHONE_NUMBER_BIND });
          }
        });
      }
    });
  }

  // v1 --- deprecated
  // doVerifyPhone(phone: string, code: string) {
  //   return new Promise((resolve, reject) => {
  //     this.findOne({ phone: phone }).then((a: IAccount) => {
  //       const verified = a && (a.verificationCode.toString() === code);
  //       this.updateOne({ _id: a._id.toString() }, { verified: verified }).then((result) => {
  //         resolve(verified);
  //       });
  //     });
  //   });
  // }






  // To do: test token is undefined or null
  getAccountByToken(tokenId: string): Promise<IAccount> {
    const cfg = new Config();
    return new Promise((resolve, reject) => {
      if (tokenId && tokenId !== 'undefined' && tokenId !== 'null') {
        try {
          const _id = jwt.verify(tokenId, cfg.JWT.SECRET);
          if (_id) {
            this.findOne({ _id }).then((account: IAccount) => {
              if (account) {
                delete account.password;
              }
              resolve(account);
            });
          } else {
            resolve();
          }
        } catch (e) {
          resolve();
        }
      } else {
        resolve();
      }
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
            const updates = { phone: phone, verificationCode: verificationCode, type: 'client' };
            this.updateOne({ _id: x._id.toString() }, updates).then(() => {
              if (x && x.password) {
                delete x.password;
              }
              x = { ...x, ...updates };
              resolve(x);
            });
          } else { // should not go here
            const data = {
              username: phone,
              phone: phone,
              type: AccountType.TEMP, // tmp user are those verified phone but did not signup under agreement
              balance: 0,
              verificationCode: verificationCode,
              verified: false,
              attributes: [],
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
          } else { // no account find
            const data = {
              username: username,
              imageurl: imageurl,
              sex: sex,
              type: 'user',
              realm: 'wechat',
              openId: openId,
              // unionId: x.unionid, // not be able to get wechat unionId
              balance: 0,
              attributes: [],
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
  doLoginByPhone(phone: string, verificationCode: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findOne({ phone: phone }).then((r: IAccount) => {
        if (r) {
          if (r.verificationCode) {
            if (r.verificationCode === verificationCode) {
              const cfg = new Config();
              const tokenId = jwt.sign(r._id.toString(), cfg.JWT.SECRET); // SHA256
              if (r.password) {
                delete r.password;
              }
              resolve(tokenId);
              // resolve({tokenId: tokenId, account: r});
            } else {
              resolve();
              // resolve({tokenId: '', account: null});
            }
          } else {
            resolve();
            // resolve({tokenId: '', account: null});
          }
        } else {
          resolve();
          // resolve({tokenId: '', account: null});
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


  // code [string] --- wechat authentication code
  wxLogin(code: string) {
    const utils = new Utils();
    const cfg = new Config();
    return new Promise((resolve, reject) => {
      try {
        utils.getWechatAccessToken(code).then((r: any) => {
          if (r && r.access_token && r.openid) {
            utils.getWechatUserInfo(r.access_token, r.openid).then((x: any) => {
              if (x && x.openid) {
                this.doWechatSignup(x.openid, x.nickname, x.headimgurl, x.sex).then((account: IAccount) => {
                  if (account) {
                    const accountId = account._id.toString();
                    const tokenId = jwt.sign(accountId, cfg.JWT.SECRET); // SHA256
                    resolve({ tokenId });
                  } else {
                    resolve();
                  }
                });
              } else {
                resolve();
              }
            });
          } else {
            resolve();
          }
        });
      } catch (e) {
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
  //   if (paymentMethod === PaymentMethod.PREPAY || paymentMethod === PaymentMethod.CASH) {
  //     return Math.round((balance + payable) * 100) / 100;
  //   } else if (paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.WECHAT) {
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