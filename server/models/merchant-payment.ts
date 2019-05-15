import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Entity } from "../entity";

export class MerchantPayment extends Model{
  balanceEntity: Entity;

  constructor(dbo: DB) {
		super(dbo, 'merchant_payments');

    this.balanceEntity = new Entity(dbo, 'merchant_balances');
  }

  createAndUpdateBalance(req: Request, rsp: Response) {
    const payment = req.body;
    this.balanceEntity.find({ merchantId: payment.merchantId }).then((x:any) => {
      if (x && x.length > 0) {
        this.balanceEntity.updateOne(
          {merchantId: payment.merchantId}, 
          {amount: x[0].amount + payment.balance}
        ).then(() => { });
      }else{
        this.balanceEntity.insertOne({
          merchantId: payment.merchantId,
          merchantName: payment.merchantName,
          amount: payment.balance,
          created: new Date(),
          modified: new Date()
        }).then(() => { });
      }
    });
    this.create(req, rsp);
  }
}