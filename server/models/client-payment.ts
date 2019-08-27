import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Entity } from "../entity";
import { Config } from "../config";

export class ClientPayment extends Model {
  cfg: Config;
  balanceEntity: Entity;
  orderEntity: Entity;
  
  constructor(dbo: DB) {
    super(dbo, 'client_payments');
    this.orderEntity = new Entity(dbo, 'orders');
    this.balanceEntity = new Entity(dbo, 'client_balances');
    this.cfg = new Config();
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

  createStripeSession(req: Request, res: Response) {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        name: 'T-shirt',
        description: 'Comfortable cotton t-shirt',
        images: ['https://example.com/t-shirt.png'],
        amount: 600, // cents
        currency: 'cad',
        quantity: 1,
      }],
      success_url: 'https://duocun.com.cn/payment/success',
      cancel_url: 'https://example.com.cn/payment/cancel',
    }).then((session :any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(session.id, null, 3));
    });
  }

  charge(req: Request, res: Response) {
    const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    const token = req.body.token;
    stripe.charges.create({
      amount: Math.round((+req.body.amount) * 100),
      currency: 'cad',
      description: req.body.merchantName,
      source: token.id,
      metadata: {orderId: req.body.orderId},
    }, function(err: any, charge: any) {
      res.setHeader('Content-Type', 'application/json');
      if(err){
        res.end(JSON.stringify({status: charge.status, chargeId: ''}, null, 3));
      }else{
        res.end(JSON.stringify({status: charge.status, chargeId: charge.id}, null, 3));
      }
    });
  }

  refund(req: Request, res: Response) {
    const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    const chargeId = req.body.chargeId;
    stripe.refunds.create({charge: chargeId}, function(err: any, re: any) {
      res.setHeader('Content-Type', 'application/json');
      if(err){
        res.end(JSON.stringify({status: err.code, refundId: ''}, null, 3));
      }else{
        res.end(JSON.stringify({status: re.status, refundId: re.id}, null, 3));
      }
    });
  }
}