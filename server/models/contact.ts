import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";
import { Config } from "../config";
import { ILocation } from "./distance";

export interface IContact {
  _id?: string;
  accountId?: string;
  username?: string;
  phone?: string;
  // account: IAccount;
  placeId?: string; // doesn't exist
  location?: ILocation; // in db
  address?: string;     // in db
  unit?: string;
  buzzCode?: string;
  verificationCode?: string; // in db
  created?: string;
  modified?: string;
}

export class Contact extends Model {

  // list(req: Request, res: Response) {
  //   let query = null;
  //   if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
  //     query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
  //   }

  //   let q = query;
  //   if (q) {
  //     if (q.where) {
  //       q = query.where;
  //     }
  //   } else {
  //     q = {};
  //   }

  //   if(q && q.accountId){
  //     q.accountId = new ObjectID(q.accountId);
  //   }

  //   const params = [
  //     {$lookup: {from: 'users', localField: 'accountId', foreignField: '_id', as: 'account'}},
  //     {$unwind: '$account'}
  //   ];
  //   this.join(params, q).then((rs: any) => {
  //     rs.map((r: any) => {
  //       delete r.password;
  //       delete r.account.password;
  //     });
  //     res.setHeader('Content-Type', 'application/json');
  //     if (rs) {
  //       res.send(JSON.stringify(rs, null, 3));
  //     } else {
  //       res.send(JSON.stringify(null, null, 3))
  //     }
  //   });
  // }

  cfg: Config;
  twilioClient: any;

  constructor(dbo: DB) {
    super(dbo, 'contacts');
    this.cfg = new Config();// JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
    this.twilioClient = require('twilio')(this.cfg.TWILIO.SID, this.cfg.TWILIO.TOKEN);
  }


  // req --- require accountId, username and phone fields
  sendVerifyMsg(req: Request, res: Response) {
    const self = this;
    const accountId = req.body.accountId;
    const username = req.body.username;
    const phoneNum = req.body.phone;
    const phone = (phoneNum.substring(0, 1) !== "+" || phoneNum.substring(0, 1) !== "1")? ("+1".concat(phoneNum)) : phoneNum; // for display
    
    const d1 = Math.floor(Math.random() * 10).toString();
    const d2 = Math.floor(Math.random() * 10).toString();
    const d3 = Math.floor(Math.random() * 10).toString();
    const d4 = Math.floor(Math.random() * 10).toString();
    const code = d1+d2+d3+d4;

    const data = {
      accountId: accountId,
      username: username,
      phone: phoneNum,
      verificationCode: code,
      verified: false
    }
    this.updateOne({accountId: accountId}, data, {upsert: true}).then((result) => {
      self.twilioClient.messages
      .create({
        body: '多村外卖验证码:' + code,
        from: '+16475591743',
        to: phone
      })
      .then((message: any) => {
        console.log(message.sid);
        res.send('verification code sent');
      });
    });
  }

  verifyCode(req: Request, res: Response) {
    const accountId = req.body.accountId;
    let code = req.body.code;
    this.findOne({accountId: accountId}).then(contact => {
      const verified = contact && contact.verificationCode.toString() === code;
      const data = {verified: verified};
      this.updateOne({_id: contact._id}, data, {upsert: false}).then((result) => {
        res.send(verified);
      });
    });
  }
}