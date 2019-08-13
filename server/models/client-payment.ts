import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Entity } from "../entity";

export class ClientPayment extends Model {
  balanceEntity: Entity;
  orderEntity: Entity;
  
  constructor(dbo: DB) {
    super(dbo, 'client_payments');
    this.orderEntity = new Entity(dbo, 'orders');
    this.balanceEntity = new Entity(dbo, 'client_balances');
  }

  createAndUpdateBalance(req: Request, res: Response) {
    if(req.body instanceof Array){
      this.insertMany(req.body).then((x: any) => {
        this.updateBalance(req, res);
      });
    }else{
      this.insertOne(req.body).then((x: any) => {
        this.updateBalance(req, res);
      });
    }
  }

  pay(req: Request, res: Response){
    const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

    (async () => {
      const charge = await stripe.charges.create({
        amount: 999,
        currency: 'usd',
        source: 'tok_visa',
        receipt_email: 'jenny.rosen@example.com',
      });
    })();
  }

  updateBalance(req: Request, res: Response){
    const self = this;
    const date = new Date('2019-05-15T00:00:00').toISOString();
    let balance = 0;

    const payment = req.body;
    const clientId = payment.clientId;

    self.orderEntity.find({clientId: clientId, delivered: { $gt: date }} ).then( os => {
      os.map((order: any) => {
        balance -= order.total;
      });

      self.find({ clientId: clientId, created: { $gt: date }}).then(ps => {
        ps.map((p: any) => {
          if (p.type === 'credit' && p.amount > 0) {
            balance += p.amount;
          }
        });

        self.balanceEntity.find({ accountId: clientId }).then((x:any) => {
          if (x && x.length > 0) {
            self.balanceEntity.updateOne({accountId: clientId}, {amount: balance}).then(() => {

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(x, null, 3));
            });
          }else{
            self.balanceEntity.insertOne({
              accountId: payment.clientId,
              accountName: payment.clientName,
              amount: balance,
              created: new Date(),
              modified: new Date()
            }).then(() => { 

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(x, null, 3));
            });
          }
        });
      });
    });
  }
}