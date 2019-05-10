import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "../db";
import { Entity } from "../entity";

export class MerchantPayment extends Entity{
  constructor(dbo: DB) {
		super(dbo, 'merchant_payments');
  }

  // get(req: Request, res: Response){
  //   const id = req.params.id;
  //   this.findOne({_id: new ObjectID(id)}).then((r: any) => {
  //     if(r){
  //       res.send(JSON.stringify(r, null, 3));
  //     }else{
  //       res.send(JSON.stringify(null, null, 3))
  //     }
  //   });
  // }

  list(req: Request, res: Response){
  
  }

  create(req: Request, res: Response){
  
  }

  replace(req: Request, res: Response){
  
  }

  update(req: Request, res: Response){
  
  }

  remove(req: Request, res: Response){
  
  }

}