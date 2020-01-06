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


  // // req --- require accountId, username and phone fields
  // sendVerifyMsg(req: Request, res: Response) {
  //   const self = this;
  //   const accountId = req.body.accountId ? req.body.accountId : new ObjectId().toString();
  //   const username = req.body.username;
  //   let phone = req.body.phone.substring(0, 2) === '+1' ? req.body.phone.substring(2) : req.body.phone;
  //   phone = phone.match(/\d+/g).join('');

  //   const d1 = Math.floor(Math.random() * 10).toString();
  //   const d2 = Math.floor(Math.random() * 10).toString();
  //   const d3 = Math.floor(Math.random() * 10).toString();
  //   const d4 = Math.floor(Math.random() * 10).toString();
  //   const code = d1 + d2 + d3 + d4;

  //   const data = {
  //     accountId: accountId,
  //     username: username,
  //     phone: phone,
  //     verificationCode: code,
  //     verified: false
  //   }

  //   if (!req.body.accountId) {
  //     // this.accountModel.insertOne({username: phone, pa})
  //   }

  //   this.updateOne({ accountId: accountId }, data, { upsert: true }).then((result) => {
  //     self.twilioClient.messages
  //       .create({
  //         body: '多村外卖验证码:' + code,
  //         from: '+16475591743',
  //         to: "+1".concat(phone)
  //       })
  //       .then((message: any) => {
  //         // console.log(message.sid);
  //         res.setHeader('Content-Type', 'application/json');
  //         res.end(JSON.stringify(accountId, null, 3));
  //       });
  //   });
  // }

  verifyCode(req: Request, res: Response) {
    const accountId = req.body.accountId;
    let code = req.body.code;
    this.findOne({ accountId: accountId }).then(contact => {
      const verified = contact && contact.verificationCode.toString() === code;
      const data = { verified: verified };
      this.updateOne({ _id: contact._id }, data, { upsert: false }).then((result) => {
        res.send(verified);
      });
    });
  }

  // Tools
  movePhoneToAccount(req: Request, res: Response) {
    this.find({}).then(cs => {
      this.accountModel.find({}).then(accounts => {
        const datas: any[] = [];

        cs.map((c: any) => {
          const a = accounts.find((x: any) => x._id.toString() === c.accountId.toString());
          if (a) {
            datas.push({
              query: { _id: a._id },
              data: { phone: c.phone, verified: true, verificationCode: c.verificationCode, location: c.location }
            });
          }
        });

        this.accountModel.bulkUpdate(datas).then(() => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(1, null, 3));
        });
      });
    });

  }
}