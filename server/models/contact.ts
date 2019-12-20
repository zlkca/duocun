import { DB } from "../db";
import { Model } from "./model";
import { ObjectId } from "mongodb";
import { Request, Response } from "express";
import { Config } from "../config";
import { ILocation } from "./distance";
import { Account } from "./account";

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
  cfg: Config;
  twilioClient: any;
  accountModel: Account;

  constructor(dbo: DB) {
    super(dbo, 'contacts');
    this.cfg = new Config();// JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
    this.twilioClient = require('twilio')(this.cfg.TWILIO.SID, this.cfg.TWILIO.TOKEN);
    this.accountModel = new Account(dbo);
  }


  // req --- require accountId, username and phone fields
  sendVerifyMsg(req: Request, res: Response) {
    const self = this;
    const accountId = req.body.accountId ? req.body.accountId: new ObjectId().toString();
    const username = req.body.username;
    let phone = req.body.phone.substring(0, 2) === '+1' ? req.body.phone.substring(2) : req.body.phone;
    phone = phone.match(/\d+/g).join('');

    const d1 = Math.floor(Math.random() * 10).toString();
    const d2 = Math.floor(Math.random() * 10).toString();
    const d3 = Math.floor(Math.random() * 10).toString();
    const d4 = Math.floor(Math.random() * 10).toString();
    const code = d1+d2+d3+d4;

    const data = {
      accountId: accountId,
      username: username,
      phone: phone,
      verificationCode: code,
      verified: false
    }
    this.updateOne({accountId: accountId}, data, {upsert: true}).then((result) => {
      self.twilioClient.messages
      .create({
        body: '多村外卖验证码:' + code,
        from: '+16475591743',
        to: "+1".concat(phone)
      })
      .then((message: any) => {
        // console.log(message.sid);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(accountId, null, 3));
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