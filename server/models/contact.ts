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
          res.send(JSON.stringify(1, null, 3));
        });
      });
    });

  }
}