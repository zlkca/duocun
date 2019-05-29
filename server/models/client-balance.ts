import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import { Request, Response } from "express";

export class ClientBalance extends Model{
  paymentEntity: Entity;
  orderEntity: Entity;
  
  constructor(dbo: DB) {
    super(dbo, 'client_balances');
    this.orderEntity = new Entity(dbo, 'orders');
    this.paymentEntity = new Entity(dbo, 'client_payments');
  }

  
}