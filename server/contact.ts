import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "./db";
import { Entity } from "./entity";
import { Config } from "./config";

export class Contact extends Entity{
  cfg: Config;
  twilioClient: any;

  constructor(dbo: DB) {
    super(dbo, 'contacts');
    this.cfg = new Config();// JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
    this.twilioClient = require('twilio')(this.cfg.TWILIO.SID, this.cfg.TWILIO.TOKEN);

  }

  get(req: Request, res: Response){
    const id = req.params.id;
    
    this.findOne({_id: new ObjectID(id)}).then((r: any) => {
      if(r){
        r.verificationCode = '';
        res.send(JSON.stringify(r, null, 3));
      }else{
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

}