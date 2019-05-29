import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Entity } from "../entity";

export class DriverPayment extends Model {
  // balanceEntity: Entity;
  constructor(dbo: DB) {
    super(dbo, 'driver_payments');

    // this.balanceEntity = new Entity(dbo, 'driver_balances');
  }

  createAndUpdateBalance(req: Request, rsp: Response) {
    // const payment = req.body;
    // this.balanceEntity.find({ accountId: payment.clientId }).then((x:any) => {
    //   if (x && x.length > 0) {
    //     this.balanceEntity.updateOne(
    //       {accountId: payment.clientId}, 
    //       {amount: x[0].amount + payment.balance}
    //     ).then(() => { });
    //   }else{
    //     this.balanceEntity.insertOne({
    //       accountId: payment.clientId,
    //       accountName: payment.clientName,
    //       amount: payment.balance,
    //       created: new Date(),
    //       modified: new Date()
    //     }).then(() => { });
    //   }
    // });
    this.create(req, rsp);
  }
}