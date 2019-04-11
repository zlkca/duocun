import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "./db";
import { Entity } from "./entity";
import { Config } from "./config";

export class Phone extends Entity{
  cfg: Config;
  twilioClient: any;

  constructor(dbo: DB) {
    super(dbo, 'phones');
    this.cfg = new Config();// JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
    this.twilioClient = require('twilio')(this.cfg.TWILIO.SID, this.cfg.TWILIO.TOKEN);
  }

  sendVerificationMessage(req: Request, res: Response) {
    const self = this;
    const accountId = req.body.accountId;
    let phoneNum = req.body.phone;
    let phone = (phoneNum.substring(0, 1) !== "+" || phoneNum.substring(0, 1) !== "1")? ("+1".concat(phoneNum)) : phoneNum;
    
    const d1 = Math.floor(Math.random() * 10).toString();
    const d2 = Math.floor(Math.random() * 10).toString();
    const d3 = Math.floor(Math.random() * 10).toString();
    const d4 = Math.floor(Math.random() * 10).toString();
    const code = d1+d2+d3+d4;

    this.findOne({accountId: accountId}).then(p => {
      if(p){
        p.phone = phoneNum;
        p.verificationCode = code;
        self.replaceById(p.id, p).then(doc => {
          
        });
      }else{
        const x = {accountId: accountId, phone: phoneNum, verificationCode: code};
        self.insertOne(x).then(doc => {

        });
      }
    });

    this.twilioClient.messages
      .create({
        body: '多村外卖验证码:' + code,
        from: '+16475591743',
        to: phone
      })
      .then((message: any) => {
        console.log(message.sid);
        res.send('verification code sent');
      });
  }

  verifyCode(req: Request, res: Response) {
    const self = this;
    const accountId = req.body.accountId;
    let code = req.body.code;
    this.findOne({accountId: accountId}).then(contact => {
      if(contact && contact.verificationCode.toString() === code){
        res.send(true);
      }else{
        res.send(false);
      }
    });
  }
}