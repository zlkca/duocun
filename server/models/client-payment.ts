import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Entity } from "../entity";
import { Config } from "../config";
import { IncomingMessage } from "http";
import https from 'https';
// import NodeRSA from 'node-rsa';
import { Md5 } from 'ts-md5';
import moment, { now } from 'moment';
import { Order } from "../models/order";
import { ClientBalance } from "./client-balance";
import { ObjectID } from "../../node_modules/@types/bson";
import { Transaction } from "./transaction";
import { resolve } from "path";

export class ClientPayment extends Model {
  cfg: Config;
  balanceEntity: ClientBalance;
  orderEntity: Order;
  transactionModel: Transaction;

  constructor(dbo: DB) {
    super(dbo, 'client_payments');

    this.orderEntity = new Order(dbo);
    this.balanceEntity = new ClientBalance(dbo);
    this.transactionModel = new Transaction(dbo);
    this.cfg = new Config();
  }

  // abandon fix me !!
  // createAndUpdateBalance(req: Request, res: Response) {
  //   if (req.body instanceof Array) {
  //     this.insertMany(req.body).then((x: any) => {
  //       this.updateBalance(req, res);
  //     });
  //   } else {
  //     this.insertOne(req.body).then((x: any) => {
  //       this.updateBalance(req, res);
  //     });
  //   }
  // }

  // abandon fix me !!
  // updateBalance(req: Request, res: Response) {
  //   const self = this;
  //   const date = new Date('2019-05-15T00:00:00').toISOString();
  //   let balance = 0;

  //   const payment = req.body;
  //   const clientId = payment.clientId;

  //   self.orderEntity.find({ clientId: clientId, delivered: { $gt: date } }).then(os => {
  //     os.map((order: any) => {
  //       balance -= order.total;
  //     });

  //     self.find({ clientId: clientId, created: { $gt: date } }).then(ps => {
  //       ps.map((p: any) => {
  //         if (p.type === 'credit' && p.amount > 0) {
  //           balance += p.amount;
  //         }
  //       });

  //       self.balanceEntity.find({ accountId: clientId }).then((x: any) => {
  //         if (x && x.length > 0) {
  //           self.balanceEntity.updateOne({ accountId: clientId }, { amount: balance }).then(() => {

  //             res.setHeader('Content-Type', 'application/json');
  //             res.end(JSON.stringify(x, null, 3));
  //           });
  //         } else {
  //           self.balanceEntity.insertOne({
  //             accountId: payment.clientId,
  //             accountName: payment.clientName,
  //             amount: balance,
  //             created: new Date(),
  //             modified: new Date()
  //           }).then(() => {

  //             res.setHeader('Content-Type', 'application/json');
  //             res.end(JSON.stringify(x, null, 3));
  //           });
  //         }
  //       });
  //     });
  //   });
  // }

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
    }).then((session: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(session.id, null, 3));
    });
  }

  stripeCreateCustomer(req: Request, res: Response) {
    const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    stripe.customers.create({
      source: req.body.source,
      name: req.body.clientName,
      phone: req.body.clientPhoneNumber,
      metadata: { clientId: req.body.clientId },
    }, function (err: any, ret: any) {
      res.setHeader('Content-Type', 'application/json');
      if (err) {
        res.end(JSON.stringify({ customerId: ret.id }, null, 3));
      } else {
        res.end(JSON.stringify({ customerId: ret.id }, null, 3));
      }
    });
  }

  stripeCharge(req: Request, res: Response) {
    const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    const token = req.body.token;
    stripe.charges.create({
      // customer: req.body.customerId,
      amount: Math.round((+req.body.amount) * 100),
      currency: 'cad',
      description: req.body.merchantName,
      source: token.id,
      metadata: { orderId: req.body.orderId, customerId: req.body.clientId, customerName: req.body.clientName },
    }, function (err: any, charge: any) {
      res.setHeader('Content-Type', 'application/json');
      if (err) {
        // res.end(JSON.stringify({ status: charge.status, chargeId: '' }, null, 3));
        res.end(JSON.stringify({ status: 'failed', chargeId: '', err: err }, null, 3));
      } else {
        res.end(JSON.stringify({ status: 'succeeded', chargeId: charge.id, err: err }, null, 3));
      }
    });
  }

  createLinkstring(data: any) {
    let s = '';
    Object.keys(data).map(k => {
      s += (k + '=' + data[k] + '&');
    });
    return s.substring(0, s.length - 1);
  }

  snappayCharge(req: Request, res: Response) {
    const b = req.body;
    const data: any = { // the order matters
      app_id: this.cfg.SNAPPAY.APP_ID,
      charset: 'UTF-8',
      description: b.merchantName,
      format: 'JSON',
      merchant_no: this.cfg.SNAPPAY.MERCHANT_ID,
      method: 'pay.h5pay', // pc+wechat: 'pay.qrcodepay', // PC+Ali: 'pay.webpay' qq browser+Wechat: pay.h5pay,
      out_order_no: b.orderId,
      payment_method: b.paymentMethod, // WECHATPAY, ALIPAY, UNIONPAY
      return_url: 'https://duocun.com.cn?orderId='+b.orderId+'&amount='+b.amount+'&paymentMethod='+b.paymentMethod,
      timestamp: new Date().toISOString().split('.')[0].replace('T',' '),
      trans_amount: b.amount,
      version: '1.0'
    };
    const sParams = this.createLinkstring(data);
    const encrypted = Md5.hashStr(sParams + this.cfg.SNAPPAY.MD5_KEY);
    data['sign'] = encrypted;
    data['sign_type'] = 'MD5';
    

    // const key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
    //   this.cfg.SNAPPAY.PRIVATE_KEY
    //   +'\n-----END RSA PRIVATE KEY-----');
    
    // const encrypted = key.encrypt(sParams, 'base64');
    // sParams + this.cfg.SNAPPAY.PUBLIC_KEY + encrypted; 

    // let url = 'https://open.snappay.ca/api/gateway' + sParams + this.cfg.SNAPPAY.PUBLIC_KEY + encrypted;
    var options = {
      hostname: 'open.snappay.ca',
      port: 443,
      path: '/api/gateway',
      method: 'POST',
      headers: {
           'Content-Type': 'application/json',
           // 'Content-Length': Buffer.byteLength(data)
         }
    };
    const post_req = https.request(options, (res1: IncomingMessage) => {
      let ss = '';
      // res1.setHeader('Content-Type', 'application/json');
      res1.on('data', (d) => {
        // process.stdout.write(d);
        ss += d;
        // console.log('receiving1: ' + ss);
      });

      res1.on('end', (rr: any) => {
        if (ss) {
          // console.log('receiving2: ' + ss);
          const s = JSON.parse(ss);
          res.send(s);
        }else{
          res.send('');
        }
      });
    });

    post_req.write(JSON.stringify(data));
    post_req.end();
  }

  stripeRefund(req: Request, res: Response) {
    const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    const chargeId = req.body.chargeId;
    stripe.refunds.create({ charge: chargeId }, function (err: any, re: any) {
      res.setHeader('Content-Type', 'application/json');
      if (err) {
        res.end(JSON.stringify({ status: err.code, refundId: '' }, null, 3));
      } else {
        res.end(JSON.stringify({ status: re.status, refundId: re.id }, null, 3));
      }
    });
  }







  addGroupDiscount(clientId: string, merchantId: string, dateType: string, address: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      const date = dateType === 'today' ? moment() : moment().add(1, 'day');
      const range = { $gte: date.startOf('day').toISOString(), $lte: date.endOf('day').toISOString() };
      const q = { delivered: range, address: address, status: { $nin: ['bad', 'del', 'tmp'] } };
      this.orderEntity.find(q).then((orders: any[]) => {
        this.orderEntity.addGroupDiscounts(clientId, orders).then((x: any) => {
          this.balanceEntity.addGroupDiscounts(orders).then((x1: any) => {
            resolve(x);
          });
        });
      });
    });
  }

  removeGroupDiscount(date: string, address: string): Promise<any> {
    return new Promise( (resolve, reject) => {
      const q = { delivered: date, address: address, status: { $nin: ['bad', 'del', 'tmp'] } }
      this.orderEntity.find(q).then((orders: any[]) => {
        this.orderEntity.removeGroupDiscounts(orders).then((orderUpdates: any[]) => {
          this.balanceEntity.removeGroupDiscounts(orders).then((balanceUpdates: any[]) => {
            resolve(orders);
          });
        });
      });
    });
  }


  reqAddGroupDiscount(req: Request, res: Response) {
    const clientId = req.body.clientId;
    const merchantId = req.body.merchantId;
    const dateType = req.body.dateType;
    const address = req.body.address;

    this.addGroupDiscount(clientId, merchantId, dateType, address).then( (xs: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'success' }, null, 3));
    });
  }

  reqRemoveGroupDiscount(req: Request, res: Response) {
    const delivered = req.body.delivered;
    const address = req.body.address;

    this.removeGroupDiscount(delivered, address).then( (xs: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'success' }, null, 3));
    });
  }

  pay(toId: string, toName: string, received: number, balance: number, orderId: string) {
    const data = {
      status: 'paid',
      driverId: toId,
      driverName: toName
    };

    return new Promise((resolve, reject) => {
      this.orderEntity.updateOne({_id: orderId}, data).then(rt => {
        this.orderEntity.findOne({_id: orderId}).then(order => {
          const tr = {
            orderId: order._id,
            fromId: order.clientId,
            fromName: order.clientName,
            toId: toId,
            toName: toName,
            type: 'credit',
            amount: received,
            note: '',
            created: order.delivered,
            modified: moment().toISOString()
          };
          this.transactionModel.insertOne(tr).then(t => {
            const remain = Math.round((received + balance) * 100) / 100;
            const q = { accountId: order.clientId };
            this.balanceEntity.updateOne(q, { amount: remain }).then(b => {
              resolve(order);
            });
          });
        });
      });
    });
  }

  payOrder(req: Request, res: Response) {
    const toId = req.body.toId;
    const toName = req.body.toName;
    const received = +req.body.received;
    const balance = +req.body.balance; 
    const orderId = req.body.orderId;

    this.pay(toId, toName, received, balance, orderId).then((order: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'success' }, null, 3));
    });
  }
}