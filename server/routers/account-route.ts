import express from "express";
import { Request, Response } from "express";

import { DB } from "../db";
import { Account, AccountAttribute, IAccount } from "../models/account";
import { MerchantStuff } from "../merchant-stuff";
import { Utils } from "../utils";
import { Config } from "../config";

export class AccountRouter {

  router = express.Router();
  accountModel: Account;
  attrModel: AccountAttribute;
  merchantStuff: MerchantStuff;
  utils: Utils;
  cfg: Config;
  constructor(db: DB) {
    this.accountModel = new Account(db);
    this.attrModel = new AccountAttribute(db);
    this.merchantStuff = new MerchantStuff(db);
    this.utils = new Utils();
    this.cfg = new Config();
  }

  init() {
    this.router.get('/attributes', (req, res) => { this.attrModel.quickFind(req, res); });

    // v1
    this.router.get('/wechatLogin', (req, res) => { this.wechatLogin(req, res); });
    // this.router.post('/verifyCode', (req, res) => { this.verifyCode(req, res); }); // deprecated

    // v2
    this.router.get('/wxLogin', (req, res) => { this.reqWxLogin(req, res); });
    this.router.get('/qFind', (req, res) => { this.accountModel.quickFind(req, res); });
    this.router.get('/shortList', (req, res) => { this.shortList(req, res); });
    this.router.get('/', (req, res) => { this.accountModel.list(req, res); });
    this.router.get('/current', (req, res) => { this.getCurrentAccount(req, res); });
    this.router.get('/:id', (req, res) => { this.accountModel.get(req, res); });

    this.router.post('/', (req, res) => { this.accountModel.create(req, res); });
    this.router.put('/', (req, res) => { this.accountModel.replace(req, res); });
    this.router.patch('/', (req, res) => { this.accountModel.update(req, res); });
    this.router.delete('/', (req, res) => { this.accountModel.remove(req, res); });

    // this.router.post('/sendClientMsg2', (req, res) => { this.accountModel.sendClientMsg2(req, res); });
    this.router.post('/sendClientMsg', (req, res) => { this.sendClientMsg(req, res); });
    this.router.post('/verifyPhoneNumber', (req, res) => { this.verifyPhoneNumber(req, res); });
    this.router.post('/sendVerifyMsg', (req, res) => { this.sendVerifyMsg(req, res); });
    this.router.post('/applyMerchant', (req, res) => { this.merchantStuff.applyMerchant(req, res); });
    this.router.post('/getMerchantApplication', (req, res) => { this.merchantStuff.getApplication(req, res); });

    this.router.post('/login', (req, res) => { this.login(req, res); });
    this.router.post('/loginByPhone', (req, res) => { this.loginByPhone(req, res); });
    this.router.route('/signup').post((req, res) => { this.signup(req, res); });


    return this.router;
  }



  loginByPhone(req: Request, res: Response) {
    const phone = req.body.phone;
    const verificationCode = req.body.verificationCode;

    this.accountModel.doLoginByPhone(phone, verificationCode).then((tokenId: string) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(tokenId, null, 3));
    });
  }

  login(req: Request, res: Response) {
    const username = req.body.username;
    const password = req.body.password;

    this.accountModel.doLogin(username, password).then((tokenId: string) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(tokenId, null, 3));
    });
  }

  wechatLogin(req: Request, res: Response) {

    const authCode = req.query.code;
    res.setHeader('Content-Type', 'application/json');

    this.utils.getWechatAccessToken(authCode).then((r: any) => {
      this.utils.getWechatUserInfo(r.access_token, r.openid).then((x: any) => { // IAccount
        this.accountModel.doWechatSignup(x.openid, x.nickname, x.headimgurl, x.sex).then((account: IAccount) => {
          if (account) {
            const accountId = account._id.toString();
            const tokenId = this.accountModel.jwtSign(accountId);
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


  // return {account, tokenId}
  reqWxLogin(req: Request, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    this.accountModel.wxLogin(req.query.code).then(r => {
      if (r) {
        res.send(JSON.stringify(r, null, 3));
      } else {
        res.send(JSON.stringify('', null, 3));
      }
    });
  }

  // req --- require accountId, username and phone fields
  sendVerifyMsg(req: Request, res: Response) {
    const self = this;
    const lang = req.body.lang;
    const accountId = req.body.accountId;
    const phone = req.body.phone;

    this.accountModel.trySignupV2(accountId, phone).then((r: any) => {
      res.setHeader('Content-Type', 'application/json');
      if (r.phone) {
        const text = (lang === 'en' ? 'Duocun Verification Code: ' : '多村验证码: ') + r.verificationCode;
        self.accountModel.sendMessage(r.phone, text).then(() => {
          if (r.accountId) {
            const tokenId = this.accountModel.jwtSign(r.accountId);
            res.send(JSON.stringify(tokenId, null, 3));
          } else {
            res.send(JSON.stringify('', null, 3)); // sign up fail, please contact admin
          }
        });
      } else {
        res.send(JSON.stringify('', null, 3)); // sign up fail, please contact admin
      }
    });
  }

  verifyPhoneNumber(req: Request, res: Response) {
    const loggedInAccountId = req.body.accountId;
    const phone = req.body.phone;
    const code = req.body.code;

    this.accountModel.verifyPhoneNumber(phone, code, loggedInAccountId).then((r: any) => {
      this.accountModel.updateAccountVerified(r).then((ret) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(ret, null, 3));
      });
    });
  }

  sendClientMsg(req: Request, res: Response) {
    const self = this;
    const lang = req.body.lang;
    const phone = req.body.phone;
    const orderType = req.body.orderType;

    res.setHeader('Content-Type', 'application/json');

    let txt;
    if (orderType === 'G') {
      txt = lang === 'en' ? 'Reminder: Your delivery arrived.' : '多村提醒您: 您的订的货已送到, 请查收';
    } else {
      txt = lang === 'en' ? 'Reminder: Your delivery arrived.' : '多村提醒您: 您的订的餐已送到, 请查收';
    }

    self.accountModel.sendMessage(phone, txt).then(() => {
      res.send(JSON.stringify('', null, 3)); // sign up fail, please contact admin
    });
  }

  // v1 --- deprecated
  // verifyCode(req: Request, res: Response) {
  //   const phone = req.body.phone;
  //   let code = req.body.code;
  //   this.accountModel.doVerifyPhone(phone, code).then((verified) => {
  //     res.setHeader('Content-Type', 'application/json');
  //     res.send(JSON.stringify(verified, null, 3));
  //   });
  // }

  list(req: Request, res: Response) {
    let query = {};
    let fields: any[];
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    if (req.headers && req.headers.fields && typeof req.headers.fields === 'string') {
      fields = (req.headers && req.headers.fields) ? JSON.parse(req.headers.fields) : null;
    }
    query = this.accountModel.convertIdFields(query);
    this.accountModel.find(query).then(accounts => {
      accounts.map((account: any) => {
        delete account.password;
      });
      const rs = this.accountModel.filterArray(accounts, fields);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(rs, null, 3));
    });
  }


  shortList(req: Request, res: Response) {
    let query = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    query = this.accountModel.convertIdFields(query);
    this.accountModel.find(query).then(accounts => {
      const rs: any[] = [];
      accounts.map((account: any) => {
        delete account.password;
        rs.push({ _id: account._id, username: account.username, phone: account.phone });
      });

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(rs, null, 3));
    });
  }

  getCurrentAccount(req: Request, res: Response) {
    const tokenId: string = req.query.tokenId;

    let fields: string[];
    if (req.headers && req.headers.fields && typeof req.headers.fields === 'string') {
      fields = (req.headers && req.headers.fields) ? JSON.parse(req.headers.fields) : null;
    }

    this.accountModel.getAccountByToken(tokenId).then(account => {
      const r = this.accountModel.filter(account, fields);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(r, null, 3));
    });
  }

  signup(req: Request, res: Response) {
    const phone = req.body.phone.toString();
    const code: string = req.body.verificationCode.toString();

    this.accountModel.doSignup(phone, code).then((account: any) => {
      res.setHeader('Content-Type', 'application/json');
      const tokenId = this.accountModel.jwtSign(account._id.toString());
      res.send(JSON.stringify(tokenId, null, 3));
    });
  }
}
