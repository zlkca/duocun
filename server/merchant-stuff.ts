import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "./db";
import { Entity } from "./entity";

export class MerchantStuff extends Entity{
  constructor(dbo: DB) {
		super(dbo, 'merchant_stuffs');
  }

  get(req: Request, res: Response){
    const id = req.params.id;
    this.findOne({_id: new ObjectID(id)}).then((r: any) => {
      if(r){
        res.send(JSON.stringify(r, null, 3));
      }else{
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  applyMerchant(req: Request, res: Response){
    const accountId = req.body.accountId;
    this.findOne({accountId: accountId}).then((r: any) => {
      if(!r){
        this.insertOne(req.body).then((x: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(x, null, 3));
        });
      }else{
        res.send(JSON.stringify(null, null, 3));
      }
    });
  }

  getApplication(req: Request, res: Response){    
    const accountId = req.body.accountId;
    this.findOne({accountId: accountId}).then((r: any) => {
      if(r){
        res.send(JSON.stringify(r, null, 3));
      }else{
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
}