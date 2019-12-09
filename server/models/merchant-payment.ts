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
    this.create(req, rsp);
  }
}