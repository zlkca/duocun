import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import moment from "moment";
import { BulkWriteOpResultObject } from "../../node_modules/@types/mongodb";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";
import { IOrder } from "../models/order";

export interface IClientCredit {
  _id: string;
  accountId: string;
  accountName: string;
  amount: number;
  status?: string;
  created?: Date;
  modified?: Date;
}

export class ClientCredit extends Model {
  paymentEntity: Entity;
  orderEntity: Entity;
  transactionEntity: Entity;

  constructor(dbo: DB) {
    super(dbo, 'client_credits');
    this.orderEntity = new Entity(dbo, 'orders');
    this.transactionEntity = new Entity(dbo, 'transactions');
    this.paymentEntity = new Entity(dbo, 'client_payments');
  }

}
