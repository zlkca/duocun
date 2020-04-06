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
import { Order, OrderType, PaymentStatus, PaymentMethod } from "../models/order";
import { Transaction, TransactionAction, IDbTransaction } from "./transaction";
import { Merchant } from "./merchant";
import { ClientCredit } from "./client-credit";
import { CellApplication, CellApplicationStatus } from "./cell-application";
import { EventLog } from "./event-log";
import { ObjectID } from "mongodb";
import { Account } from "./account";
import { SystemConfig } from "./system-config";

const CASH_BANK_ID = '5c9511bb0851a5096e044d10';
const CASH_BANK_NAME = 'Cash Bank';
const TD_BANK_ID = '5c95019e0851a5096e044d0c';
const TD_BANK_NAME = 'TD Bank';
const SNAPPAY_BANK_ID = '5e60139810cc1f34dea85349';
const SNAPPAY_BANK_NAME = 'SnapPay Bank';

// var fs = require('fs');
// var util = require('util');
// // var log_file = fs.createWriteStream('~/duocun-debug.log', {flags : 'w'}); // __dirname + 
// var log_stdout = process.stdout;

// console.log = function (d: any) { // 
//   // log_file.write(util.format(d) + '\n');
//   log_stdout.write(util.format(d) + '\n');
// };
export const PaymentError = {
  NONE: 'N',
  PHONE_EMPTY: 'PE',
  LOCATION_EMPTY: 'LE',
  DUPLICATED_SUBMIT: 'DS',
  CART_EMPTY: 'CE',
  BANK_CARD_EMPTY: 'BE',
  INVALID_BANK_CARD: 'IB',
  BANK_CARD_FAIL: 'BF',
  WECHATPAY_FAIL: 'WF',
  CREATE_BANK_CUSTOMER_FAIL: 'CBCF',
  BANK_INSUFFICIENT_FUND: 'BIF',
  BANK_CARD_DECLIEND: 'BCD',
  INVALID_ACCOUNT: 'IA',
  BANK_AUTHENTICATION_REQUIRED: 'BAR',
  PAYMENT_METHOD_ID_MISSING: 'IDM'
};

export const PaymentAction = {
  PAY: { code: 'P', text: 'Pay' },
  ADD_CREDIT: { code: 'A', text: 'Add Credit' }
}

export const ResponseStatus = {
  SUCCESS: 'S',
  FAIL: 'F'
}

export interface IPaymentResponse {
  status: string;       // ResponseStatus
  code: string;         // stripe/snappay return code
  decline_code: string; // strip decline_code
  msg: string;          // stripe/snappay retrun message
  chargeId: string;     // stripe { chargeId:x }
  url: string;          // snappay {url: data[0].h5pay_url} //  { code, data, msg, total, psn, sign }
}

export interface IStripeError {
  type: string;
  code: string;
  decline_code: string;
  message: string;
  param: string;
  payment_intent: any;
}

export class ClientPayment extends Model {
  cfg: Config;
  orderEntity: Order;
  transactionModel: Transaction;
  merchantModel: Merchant;
  clientCreditModel: ClientCredit;
  cellApplicationModel: CellApplication;
  eventLogModel: EventLog;
  accountModel: Account;
  cfgModel: SystemConfig;

  constructor(dbo: DB) {
    super(dbo, 'client_payments');
    this.accountModel = new Account(dbo);
    this.orderEntity = new Order(dbo);
    this.merchantModel = new Merchant(dbo);
    this.transactionModel = new Transaction(dbo);
    this.clientCreditModel = new ClientCredit(dbo);
    this.cellApplicationModel = new CellApplication(dbo);
    this.eventLogModel = new EventLog(dbo);
    this.cfgModel = new SystemConfig(dbo);
    this.cfg = new Config();
  }

  // appCode --- '122':grocery, '123':food delivery
  // actionCode --- P: Pay, A: Add credit
  // paymentId --- paymentId represent a batch of orders
  async getSnappayData(appCode: string, actionCode: string, accountId: string, paymentId: string, amount: number, description: string) {
    const cfgs = await this.cfgModel.find({});
    const cfg = cfgs[0];
    const method = cfg.snappay.methods.find((m: any) => m.code = 'WECHATPAY');
    const app = method.apps.find((a: any) => a.code === appCode);
    const notify_url = app ? app.notifyUrl : ''; // 'https://duocun.com.cn/api/ClientPayments/notify';
    const returnUrl = app ? app.returnUrls.find((r: any) => r.action === actionCode) : { url: '' }; 'https://duocun.ca/grocery?p=h&cId='
    const return_url = returnUrl.url + accountId; // 'https://duocun.ca/grocery?p=h&cId=' + accountId;
    const trans_amount = Math.round(amount * 100) / 100;

    return { // the order matters
      app_id: this.cfg.SNAPPAY.APP_ID,           // Madatory
      charset: 'UTF-8',                          // Madatory
      description: description,                  // Service Mandatory
      format: 'JSON',                            // Madatory
      merchant_no: this.cfg.SNAPPAY.MERCHANT_ID, // Service Mandatory
      method: 'pay.h5pay', // pc+wechat: 'pay.qrcodepay', // PC+Ali: 'pay.webpay' qq browser+Wechat: pay.h5pay,
      notify_url,                                // 'https://duocun.com.cn/api/ClientPayments/notify',
      out_order_no: paymentId,                   // Service Mandatory
      payment_method: 'WECHATPAY',               // paymentMethod, // WECHATPAY, ALIPAY, UNIONPAY
      return_url,
      trans_amount,                             // Service Mandatory
      // trans_currency: 'CAD',
      version: '1.0'                           // Madatory
    };
  }

  // v2
  // return {url}
  snappayPay(accountId: string, appCode: string, actionCode: string, amount: number, description: string, paymentId: string) {
    const self = this;

    return new Promise((resolve, reject) => {
      this.getSnappayData(appCode, actionCode, accountId, paymentId, amount, description).then(data => {
        const params = this.snappaySignParams(data);
        const options = {
          hostname: 'open.snappay.ca',
          port: 443,
          path: '/api/gateway',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Content-Length': Buffer.byteLength(data)
          }
        };

        const eventLog = {
          accountId: accountId,
          type: 'debug',
          code: JSON.stringify(params),
          decline_code: '',
          message: 'snappay send req, paymentId:' + paymentId,
          created: moment().toISOString()
        }
        this.eventLogModel.insertOne(eventLog).then(() => {

        });


        const post_req = https.request(options, (res: IncomingMessage) => {
          let ss = '';
          res.on('data', (d) => { ss += d; });
          res.on('end', (r: any) => {
            if (ss) { // { code, data, msg, total, psn, sign }
              const ret = JSON.parse(ss); // s.data = {out_order_no:x, merchant_no:x, trans_status:x, h5pay_url}
              const eventLog = {
                accountId: accountId,
                type: 'snappay',
                code: ret ? ret.code : '',
                decline_code: '',
                message: ret ? ret.message : '',
                created: moment().toISOString()
              }

              const rsp: IPaymentResponse = {
                status: (ret && ret.msg === 'success') ? ResponseStatus.SUCCESS : ResponseStatus.FAIL,
                code: ret ? ret.code : '',                    // stripe/snappay code
                decline_code: '',    // stripe decline_code
                msg: ret ? ret.msg : '',                  // stripe/snappay retrun message
                chargeId: '',            // stripe { chargeId:x }
                url: (ret.data && ret.data[0]) ? ret.data[0].h5pay_url : ''   // snappay data[0].h5pay_url
              }
              if (ret && ret.msg === 'success') {
                resolve(rsp);
              } else {
                self.eventLogModel.insertOne(eventLog).then(() => {
                  resolve(rsp);
                });
              }
            } else {
              const rsp: IPaymentResponse = {
                status: ResponseStatus.FAIL,
                code: 'UNKNOWN_ISSUE',  // snappay return code
                decline_code: '',       // stripe decline_code
                msg: 'UNKNOWN_ISSUE',   // snappay retrun message
                chargeId: '',           // stripe { chargeId:x }
                url: ''                 // for snappay data[0].h5pay_url
              }
              resolve(rsp);
            }
          });
        });

        post_req.on('error', (error: any) => { // Reject on request error.
          const rsp: IPaymentResponse = {
            status: ResponseStatus.FAIL,
            code: 'UNKNOWN_ISSUE',  // snappay return code
            decline_code: '',       // stripe decline_code
            msg: 'UNKNOWN_ISSUE',   // snappay retrun message
            chargeId: '',           // stripe { chargeId:x }
            url: ''                 // for snappay data[0].h5pay_url
          }

          const eventLog = {
            accountId: accountId,
            type: 'snappay',
            code: 'Request Snappay',
            decline_code: '',
            message: JSON.stringify(error),
            created: moment().toISOString()
          }

          self.eventLogModel.insertOne(eventLog).then(() => {
            resolve(rsp);
          });
        });
        post_req.write(JSON.stringify(params));
        post_req.end();
      });
    });
  }


  // stripe new API
  async trySaveStripeCard(accountId: string, paymentMethodId: string) {
    const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    const account = await this.accountModel.findOne({ _id: accountId }, null, ['_id', 'cardAccountId', 'cards']);
    if (account) {
      try {
        if (account.cardAccountId) {
          const customerId = account.cardAccountId;
          if (account.cards) {
            if (account.cards.indexOf(paymentMethodId) !== -1) { // has customerId and the same paymentMethodId, not need to create
              // pass
            } else { // has customerId but card didn't attached, attach the card
              await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
              const cards = [...account.cards, paymentMethodId];
              await this.accountModel.updateOne({ _id: accountId }, { cards });
            }
          } else { // previous failed to save cards
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
            await this.accountModel.updateOne({ _id: accountId }, { cards: [paymentMethodId] });
          }
          return { customerId, err: PaymentError.NONE };
        } else {
          const customer = await stripe.customers.create({
            payment_method: paymentMethodId
          });
          const customerId = customer.id;
          if (customerId) {
            await this.accountModel.updateOne({ _id: accountId }, { cardAccountId: customerId, cards: [paymentMethodId] });
            return { customerId, err: PaymentError.NONE };
          } else {
            return { err: PaymentError.CREATE_BANK_CUSTOMER_FAIL };
          }
        }
      } catch (e) { // code and message
        let err = PaymentError.BANK_CARD_DECLIEND;
        if (e.statusCode === 402) {
          err = PaymentError.BANK_INSUFFICIENT_FUND;
        } else if (e.statusCode === 404) {
          err = PaymentError.PAYMENT_METHOD_ID_MISSING;
        }
        const eventLog = {
          accountId,
          type: e ? e.type : '',
          code: e ? e.code : '',
          decline_code: e ? e.decline_code : '',
          message: e ? e.message : '',
          created: moment().toISOString()
        }
        await this.eventLogModel.insertOne(eventLog);
        console.log(e);
        return { err };
      }
    } else {
      return { err: PaymentError.INVALID_ACCOUNT };
    }
  }

  // metadata eg. { orderId: orderId, customerId: clientId, customerName: order.clientName, merchantName: order.merchantName };
  async stripePay(paymentMethodId: string, accountId: string, amount: number, currency: string, description: string, metadata: any) {
    const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    const rt = await this.trySaveStripeCard(accountId, paymentMethodId);
    const customerId = rt.customerId;
    if (rt.err === PaymentError.NONE && customerId) {
      try {
        await stripe.paymentIntents.create({
          amount: Math.round((amount) * 100),
          currency,
          customer: customerId,
          payment_method: paymentMethodId,
          error_on_requires_action: true,
          confirm: true,
          description,
          metadata
        });
        return { status: ResponseStatus.SUCCESS, err: rt.err };
      } catch (err) {
        console.log('Error code is: ', err.code);
        if (err.raw && err.raw.payment_intent) {
          const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
          // if(paymentIntentRetrieved){
          //   console.log('PI retrieved: ', paymentIntentRetrieved.id);
          // }
        }
        const eventLog = {
          accountId,
          type: err ? err.type : '',
          code: err ? err.code : '',
          decline_code: err ? err.decline_code : '',
          message: err ? err.message : '',
          created: moment().toISOString()
        }
        let error = PaymentError.BANK_CARD_DECLIEND;
        if (err && err.code) {
          if (err.code === 'authentication_required') {
            error = PaymentError.BANK_AUTHENTICATION_REQUIRED;
          }
        }
        await this.eventLogModel.insertOne(eventLog);
        return { status: ResponseStatus.FAIL, err: error };
      }
    } else {
      return { status: ResponseStatus.FAIL, err: rt.err };
    }

  }

  getChargeSummary(orders: any[]) {
    let price = 0;
    let cost = 0;

    if (orders && orders.length > 0) {
      orders.map((order: any) => {
        order.items.map((x: any) => {
          price += x.price * x.quantity;
          cost += x.cost * x.quantity;
        });
      });
    }

    return { price, cost };
  }

  // v2 --- each order has a paymentId
  payBySnappay(req: Request, res: Response) {
    const appCode = req.body.appCode;
    const orders = req.body.orders;
    const actionCode = orders && orders.length > 0 ? PaymentAction.PAY.code : PaymentAction.ADD_CREDIT.code;
    const accountId = req.body.accountId;
    const accountName = req.body.accountName;
    const note = req.body.note;
    const paymentMethod = PaymentMethod.WECHAT; // orders[0].paymentMethod;
    let amount = Math.round((+req.body.amount) * 100) / 100;

    res.setHeader('Content-Type', 'application/json');

    if (actionCode === PaymentAction.PAY.code) {  // pay order
      const order = orders[0];
      const paymentId = order.paymentId;
      const description = order.merchantName;
      // returnUrl = 'https://duocun.com.cn/cell?clientId=' + clientId + '&paymentMethod=' + paymentMethod + '&page=application_form';

      this.snappayPay(accountId, appCode, actionCode, amount, description, paymentId).then((rsp: any) => {
        if (rsp && rsp.status === ResponseStatus.FAIL) {
          const r = { ...rsp, err: PaymentError.WECHATPAY_FAIL };
          res.send(JSON.stringify(r, null, 3)); // IPaymentResponse
        } else {

          this.orderEntity.processAfterPay(paymentId, TransactionAction.PAY_BY_WECHAT.code, amount, '').then(() => {
            // const eventLog = {
            //   accountId: accountId,
            //   type: 'Snappay',
            //   code: 'wechatpay',
            //   decline_code: '',
            //   message: 'wait notify',
            //   created: moment().toISOString()
            // }
            // this.eventLogModel.insertOne(eventLog).then(() => {
            const r = { ...rsp, err: PaymentError.NONE };
            res.send(JSON.stringify(r, null, 3)); // IPaymentResponse
            // });
          });
        }
      });
    } else {  // add credit
      if (amount > 0) {
        const paymentId = new ObjectID().toString();
        const cc = {
          accountId,
          accountName,
          total: Math.round(amount * 100) / 100,
          paymentMethod,
          note,
          paymentId,
          status: PaymentStatus.UNPAID
        }

        this.clientCreditModel.insertOne(cc).then((c) => {
          // returnUrl = 'https://duocun.com.cn/cell?clientId=' + accountId + '&paymentMethod=' + paymentMethod + '&page=application_form';
          this.snappayPay(accountId, appCode, actionCode, amount, 'Add Credit', paymentId).then((rsp: any) => {
            if (rsp && rsp.status === ResponseStatus.FAIL) {
              const r = { ...rsp, err: PaymentError.WECHATPAY_FAIL };
              res.send(JSON.stringify(r, null, 3)); // IPaymentResponse
            } else {
              const r = { ...rsp, err: PaymentError.NONE };
              res.send(JSON.stringify(r, null, 3)); // IPaymentResponse
            }
          });
        });
      } else {
        res.send(JSON.stringify(null, null, 3));
      }
    }
  }

  // v2 --- each order has a paymentId
  payByCreditCard(req: Request, res: Response) {
    // const appType = req.body.appType;
    const paymentMethodId = req.body.paymentMethodId;
    const accountId = req.body.accountId;
    const accountName = req.body.accountName;
    const orders = req.body.orders;
    const note = req.body.note;
    let amount = +req.body.amount;
    let metadata = {};
    let description = '';
    let paymentId = new ObjectID().toString();

    res.setHeader('Content-Type', 'application/json');

    if (orders && orders.length > 0) {  // pay order
      const order = orders[0];
      // const orderIds = orders.map((order: any) => order._id);;
      // let { price, cost } = this.getChargeSummary(orders); 
      metadata = { paymentId: order.paymentId };
      description = accountName + ' pay ' + orders[0].merchantName;
      paymentId = order.paymentId;
    } else {
      metadata = { customerId: accountId, customerName: accountName };
      description = accountName + 'add credit';
    }

    this.stripePay(paymentMethodId, accountId, amount, 'cad', description, metadata).then((rsp: any) => {
      const cc = {
        accountId,
        accountName,
        total: Math.round(amount * 100) / 100,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        note,
        paymentId,
        status: PaymentStatus.UNPAID
      }

      if (rsp.err === PaymentError.NONE) {
        this.clientCreditModel.insertOne(cc).then((c) => {
          this.orderEntity.processAfterPay(paymentId, TransactionAction.PAY_BY_CARD.code, amount, rsp.chargeId).then(() => {
            res.send(JSON.stringify(rsp, null, 3)); // IPaymentResponse
          });
        });
      } else {
        res.send(JSON.stringify(rsp, null, 3)); // IPaymentResponse
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


  // This request could response multiple times !!!
  // return rsp: IPaymentResponse
  snappayNotify(req: Request, res: Response) {
    const rsp = req.body;

    // console.log('snappayNotify trans_status:' + b.trans_status);
    // console.log('snappayNotify trans_no:' + b.trans_no);
    // console.log('snappayNotify out_order_no' + b.out_order_no);
    // console.log('snappayNotify customer_paid_amount' + b.customer_paid_amount);
    // console.log('snappayNotify trans_amount' + b.trans_amount);
    const amount = Math.round(+req.body.trans_amount * 100)/100;
    const paymentId = rsp ? rsp.out_order_no : '';
    const eventLog = {
      accountId: SNAPPAY_BANK_ID,
      type: 'debug',
      code: JSON.stringify(req.body),
      decline_code: '',
      message: 'snappay notify received, paymentId:' + paymentId,
      created: moment().toISOString()
    }
    this.eventLogModel.insertOne(eventLog).then(() => { });

    if (rsp && rsp.trans_status === "SUCCESS") {
      this.orderEntity.find({ paymentId }).then(orders => {
        const order = orders[0];
        const delivered: any = order.delivered;
        const clientId = order.clientId.toString();
        const actionCode = TransactionAction.PAY_BY_WECHAT.code;
        this.orderEntity.addDebitTransactions(orders).then(() => {
          this.orderEntity.addCreditTransaction(paymentId, clientId, order.clientName, amount, actionCode, delivered).then(t => {
            this.orderEntity.updateOrdersAsPaid(orders, t).then(() => {
              res.setHeader('Content-Type', 'application/json');
              res.send({ code: '0' }); // must return as snappay gateway required
            });
          });
        });
      });
    }
  }

    // // deprecated
    // createStripeSession(req: Request, res: Response) {
    //   // Set your secret key: remember to change this to your live secret key in production
    //   // See your keys here: https://dashboard.stripe.com/account/apikeys
    //   const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    //   stripe.checkout.sessions.create({
    //     payment_method_types: [PaymentMethod.CREDIT_CARD],
    //     line_items: [{
    //       name: 'T-shirt',
    //       description: 'Comfortable cotton t-shirt',
    //       images: ['https://example.com/t-shirt.png'],
    //       amount: 600, // cents
    //       currency: 'cad',
    //       quantity: 1,
    //     }],
    //     success_url: 'https://duocun.com.cn/payment/success',
    //     cancel_url: 'https://example.com.cn/payment/cancel',
    //   }).then((session: any) => {
    //     res.setHeader('Content-Type', 'application/json');
    //     res.send(JSON.stringify(session.id, null, 3));
    //   });
    // }

    // // deprecated
    // stripeCreateCustomer(req: Request, res: Response) {
    //   const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    //   stripe.customers.create({
    //     source: req.body.source,
    //     name: req.body.clientName,
    //     phone: req.body.clientPhoneNumber,
    //     metadata: { clientId: req.body.clientId },
    //   }, function (err: any, ret: any) {
    //     res.setHeader('Content-Type', 'application/json');
    //     if (err) {
    //       res.send(JSON.stringify({ customerId: ret.id }, null, 3));
    //     } else {
    //       res.send(JSON.stringify({ customerId: ret.id }, null, 3));
    //     }
    //   });
    // }

    // // v1 deprecated
    // // return rsp: IPaymentResponse
    // stripeAddCredit(req: Request, res: Response) {
    //   const self = this;
    //   const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    //   const token = req.body.token;
    //   const accountId = req.body.accountId;
    //   const accountName = req.body.accountName;
    //   const paid = +req.body.paid;
    //   const note = req.body.note;

    //   stripe.charges.create({
    //     // customer: req.body.customerId,
    //     amount: Math.round((paid) * 100),
    //     currency: 'cad',
    //     description: 'client add credit by card',
    //     source: token.id,
    //     metadata: { customerId: accountId, customerName: accountName },
    //   }, function (err: IStripeError, charge: any) {

    //     const eventLog = {
    //       accountId: accountId,
    //       type: err ? err.type : '',
    //       code: err ? err.code : '',
    //       decline_code: err ? err.decline_code : '',
    //       message: err ? err.message : '',
    //       created: moment().toISOString()
    //     }

    //     const rsp: IPaymentResponse = {
    //       status: err ? ResponseStatus.FAIL : ResponseStatus.SUCCESS,
    //       code: err ? err.code : '',                    // stripe/snappay code
    //       decline_code: err ? err.decline_code : '',    // stripe decline_code
    //       msg: err ? err.message : '',                  // stripe/snappay retrun message
    //       chargeId: charge ? charge.id : '',            // stripe { chargeId:x }
    //       url: ''                                       // for snappay data[0].h5pay_url
    //     }

    //     res.setHeader('Content-Type', 'application/json');
    //     if (!err) {
    //       self.transactionModel.doAddCredit(accountId, accountName, paid, PaymentMethod.CREDIT_CARD, note).then((x: IDbTransaction) => {
    //         res.send(JSON.stringify(rsp, null, 3));
    //       });
    //     } else {
    //       self.eventLogModel.insertOne(eventLog).then(() => {
    //         res.send(JSON.stringify(rsp, null, 3));
    //       });
    //     }
    //   });
    // }

    // v1 deprecated
    // return rsp: IPaymentResponse
    // stripePayOrder(req: Request, res: Response) {
    //   const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
    //   const token = req.body.token;
    //   const orderId = req.body.orderId;
    //   const paid = +req.body.paid;
    //   const self = this;
    //   self.orderEntity.findOne({ _id: orderId }).then(order => {
    //     const clientId = order.clientId.toString();
    //     const metadata = { orderId: orderId, customerId: clientId, customerName: order.clientName, merchantName: order.merchantName };
    //     stripe.charges.create({
    //       // customer: req.body.customerId,
    //       amount: Math.round((paid) * 100),
    //       currency: 'cad',
    //       description: order.merchantName,
    //       source: token.id,
    //       metadata: metadata
    //     }, function (err: IStripeError, charge: any) {

    //       const eventLog = {
    //         accountId: clientId,
    //         type: err ? err.type : '',
    //         code: err ? err.code : '',
    //         decline_code: err ? err.decline_code : '',
    //         message: err ? err.message : '',
    //         created: moment().toISOString()
    //       }

    //       const rsp: IPaymentResponse = {
    //         status: err ? ResponseStatus.FAIL : ResponseStatus.SUCCESS,
    //         code: err ? err.code : '',                    // stripe/snappay code
    //         decline_code: err ? err.decline_code : '',    // stripe decline_code
    //         msg: err ? err.message : '',                  // stripe/snappay retrun message
    //         chargeId: charge ? charge.id : '',            // stripe { chargeId:x }
    //         url: ''                                       // for snappay data[0].h5pay_url
    //       }

    //       res.setHeader('Content-Type', 'application/json');
    //       if (!err) {
    //         // update order and insert transactions
    //         self.orderEntity.doProcessPayment(order, TransactionAction.PAY_BY_CARD.code, paid, charge.id).then(() => {
    //           res.send(JSON.stringify(rsp, null, 3));
    //         });
    //       } else {
    //         self.eventLogModel.insertOne(eventLog).then(() => {
    //           res.send(JSON.stringify(rsp, null, 3));
    //         });
    //       }
    //     });
    //   });
    // }



    // stripe.paymentIntents.create({
    //   amount: Math.round((amount) * 100),
    //   currency,
    //   customer: accountId.toString(),
    //   payment_method: paymentMethodId,
    //   error_on_requires_action: true,
    //   confirm: true,
    //   description,
    //   metadata
    // }, function (err: IStripeError, paymentIntent: any) {
    //   const eventLog = {
    //     accountId,
    //     type: err ? err.type : '',
    //     code: err ? err.code : '',
    //     decline_code: err ? err.decline_code : '',
    //     message: err ? err.message : '',
    //     created: moment().toISOString()
    //   }

    //   const rsp: IPaymentResponse = {
    //     status: err ? ResponseStatus.FAIL : ResponseStatus.SUCCESS,
    //     code: err ? err.code : '',                        // stripe/snappay code
    //     decline_code: err ? err.decline_code : '',        // stripe decline_code
    //     msg: err ? err.message : '',                      // stripe/snappay retrun message
    //     chargeId: paymentIntent ? paymentIntent.id : '',  // stripe { chargeId:x }
    //     url: ''                                           // for snappay data[0].h5pay_url
    //   }

    //   if (!err) {
    //     resolve(rsp);
    //   } else {
    //     self.eventLogModel.insertOne(eventLog).then(() => {
    //       resolve(rsp);
    //     });
    //   }
    // });
    // })
    // const clientId = order.clientId.toString();
    // const metadata = { orderId: orderId, customerId: clientId, customerName: order.clientName, merchantName: order.merchantName };
    //     res.setHeader('Content-Type', 'application/json');
    //     if (!err) {
    //       // update order and insert transactions
    //       self.orderEntity.doProcessPayment(order, TransactionAction.PAY_BY_CARD.code, paid, charge.id).then(() => {
    //         res.send(JSON.stringify(rsp, null, 3));
    //       });
    //     } else {
    //       self.eventLogModel.insertOne(eventLog).then(() => {
    //         res.send(JSON.stringify(rsp, null, 3));
    //       });
    //     }
    //   });
    // });


    // v1 deprecated
    // return rsp: IPaymentResponse
    snappayAddCredit(req: Request, res: Response) {
      const paid = +req.body.paid;
      const account = req.body.account;
      const paymentMethod = req.body.paymentMethod;
      const note = req.body.note;

      const cc = {
        accountId: account._id,
        accountName: account.username,
        total: Math.round(paid * 100) / 100,
        paymentMethod: paymentMethod,
        note: note,
        status: PaymentStatus.UNPAID
      }

      this.clientCreditModel.insertOne(cc).then((c) => {
        const returnUrl = 'https://duocun.com.cn?clientId=' + account._id.toString() + '&paymentMethod=' + paymentMethod + '&page=account_settings';
        this.snappayPayReq(res, returnUrl, account._id, c._id.toString(), paymentMethod, paid, 'add credit');
      });
    }


    // deprecated
    // return rsp: IPaymentResponse
    snappayPayOrder(req: Request, res: Response) {
      const paid = req.body.paid;
      const order = req.body.order;
      const clientId = order.clientId;
      const paymentMethod = order.paymentMethod;
      let returnUrl = 'https://duocun.com.cn?clientId=' + clientId + '&paymentMethod=' + paymentMethod + '&page=order_history';

      if (order.type === OrderType.MOBILE_PLAN_SETUP) {
        returnUrl = 'https://duocun.com.cn/cell?clientId=' + clientId + '&paymentMethod=' + paymentMethod + '&page=application_form';
      }

      this.snappayPayReq(res, returnUrl, clientId, order._id, paymentMethod, paid, order.merchantName);
    }

    snappaySignParams(data: any) {
      const sParams = this.createLinkstring(data);
      const encrypted = Md5.hashStr(sParams + this.cfg.SNAPPAY.MD5_KEY);
      data['sign'] = encrypted;
      data['sign_type'] = 'MD5';
      return data;
    }

    // v1
    snappayPayReq(res: Response, returnUrl: string, accountId: string, orderId: string, paymentMethod: string, paid: number, description: string) {
      const data: any = { // the order matters
        app_id: this.cfg.SNAPPAY.APP_ID,           // Madatory
        charset: 'UTF-8',                          // Madatory
        description: description,           // Service Mandatory
        format: 'JSON',                            // Madatory
        merchant_no: this.cfg.SNAPPAY.MERCHANT_ID, // Service Mandatory
        method: 'pay.h5pay', // pc+wechat: 'pay.qrcodepay', // PC+Ali: 'pay.webpay' qq browser+Wechat: pay.h5pay,
        notify_url: 'https://duocun.com.cn/api/ClientPayments/notify',
        out_order_no: orderId,                   // Service Mandatory
        payment_method: paymentMethod,       // WECHATPAY, ALIPAY, UNIONPAY
        return_url: returnUrl,
        trans_amount: paid,                        // Service Mandatory
        version: '1.0'                             // Madatory
      };
      const self = this;
      const params = this.snappaySignParams(data);
      const options = {
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
        res1.on('data', (d) => { ss += d; });
        res1.on('end', (r: any) => {
          if (ss) { // { code, data, msg, total, psn, sign }
            const ret = JSON.parse(ss); // s.data = {out_order_no:x, merchant_no:x, trans_status:x, h5pay_url}

            const eventLog = {
              accountId: accountId,
              type: 'snappay',
              code: ret ? ret.code : '',
              decline_code: '',
              message: ret ? ret.message : '',
              created: moment().toISOString()
            }

            const rsp: IPaymentResponse = {
              status: (ret && ret.msg === 'success') ? ResponseStatus.SUCCESS : ResponseStatus.FAIL,
              code: ret ? ret.code : '',                    // stripe/snappay code
              decline_code: '',    // stripe decline_code
              msg: ret ? ret.msg : '',                  // stripe/snappay retrun message
              chargeId: '',            // stripe { chargeId:x }
              url: (ret.data && ret.data[0]) ? ret.data[0].h5pay_url : ''   // snappay data[0].h5pay_url
            }

            if (ret.msg === 'success') {
              res.send(rsp);
            } else {
              self.eventLogModel.insertOne(eventLog).then(() => {
                res.send(rsp);
              });
            }
          } else {
            const rsp: IPaymentResponse = {
              status: ResponseStatus.FAIL,
              code: 'UNKNOWN_ISSUE',  // snappay return code
              decline_code: '',       // stripe decline_code
              msg: 'UNKNOWN_ISSUE',   // snappay retrun message
              chargeId: '',           // stripe { chargeId:x }
              url: ''                 // for snappay data[0].h5pay_url
            }
            res.send(rsp);
          }
        });
      });

      post_req.write(JSON.stringify(params));
      post_req.end();
    }

    // deprecated
    snappayQueryOrderReq(out_order_no: string) {
      const merchant_no = this.cfg.SNAPPAY.MERCHANT_ID;
      const data: any = { // the order matters
        app_id: this.cfg.SNAPPAY.APP_ID,  // Mandatory
        charset: 'UTF-8',                 // Mandatory
        format: 'JSON',                   // Mandatory
        merchant_no: merchant_no,         // Service Mandatory
        method: 'pay.orderquery',         // Service Mandatory
        out_order_no: out_order_no,       // Service Optional
        version: '1.0'                    // Mandatory
      };

      const params = this.snappaySignParams(data);
      const options = {
        hostname: 'open.snappay.ca',
        port: 443,
        path: '/api/gateway',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Length': Buffer.byteLength(data)
        }
      };

      return new Promise((resolve, reject) => {
        const post_req = https.request(options, (res1: IncomingMessage) => {
          let ss = '';
          res1.on('data', (d) => { ss += d; });
          res1.on('end', (r: any) => {
            if (ss) { // code, data, msg, total, psn, sign
              const ret = JSON.parse(ss); // s.data = {trans_no:x, out_order_no:x, merchant_no:x, trans_status:x }
              if (ret.msg === 'success') {
                resolve(ret);
                console.log(ss);
              } else {
                resolve(ret);
              }
            } else {
              resolve({ msg: 'failed' });
            }
          });
        });

        post_req.write(JSON.stringify(params));
        post_req.end();
      });
    }

    // deprecated
    stripeRefund(req: Request, res: Response) {
      const stripe = require('stripe')(this.cfg.STRIPE.API_KEY);
      const chargeId = req.body.chargeId;
      stripe.refunds.create({ charge: chargeId }, function (err: any, re: any) {
        res.setHeader('Content-Type', 'application/json');
        if (err) {
          res.send(JSON.stringify({ status: err.code, refundId: '' }, null, 3));
        } else {
          res.send(JSON.stringify({ status: re.status, refundId: re.id }, null, 3));
        }
      });
    }

    // deprecated
    // addGroupDiscount(clientId: string, merchantId: string, dateType: string, address: string): Promise<any> {
    //   return new Promise((resolve, reject) => {
    //     const date = dateType === 'today' ? moment() : moment().add(1, 'day');
    //     const range = { $gte: date.startOf('day').toISOString(), $lte: date.endOf('day').toISOString() };
    //     const q = { delivered: range, address: address, status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] } };
    //     this.orderEntity.find(q).then((orders: any[]) => {
    //       this.orderEntity.addGroupDiscounts(clientId, orders).then((x: any) => {
    //         this.balanceEntity.addGroupDiscounts(orders).then((x1: any) => {
    //           resolve(x);
    //         });
    //       });
    //     });
    //   });
    // }

    // deprecated
    // removeGroupDiscount(date: string, address: string): Promise<any> {
    //   return new Promise((resolve, reject) => {
    //     const q = { delivered: date, address: address, status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] } }
    //     this.orderEntity.find(q).then((orders: any[]) => {
    //       this.orderEntity.removeGroupDiscounts(orders).then((orderUpdates: any[]) => {
    //         this.balanceEntity.removeGroupDiscounts(orders).then((balanceUpdates: any[]) => {
    //           resolve(orders);
    //         });
    //       });
    //     });
    //   });
    // }

    // deprecated
    // reqAddGroupDiscount(req: Request, res: Response) {
    //   const clientId = req.body.clientId;
    //   const merchantId = req.body.merchantId;
    //   const dateType = req.body.dateType;
    //   const address = req.body.address;

    //   this.addGroupDiscount(clientId, merchantId, dateType, address).then((xs: any) => {
    //     res.setHeader('Content-Type', 'application/json');
    //     res.send(JSON.stringify({ status: 'success' }, null, 3));
    //   });
    // }

    // deprecated
    // reqRemoveGroupDiscount(req: Request, res: Response) {
    //   const delivered = req.body.delivered;
    //   const address = req.body.address;

    //   this.removeGroupDiscount(delivered, address).then((xs: any) => {
    //     res.setHeader('Content-Type', 'application/json');
    //     res.send(JSON.stringify({ status: 'success' }, null, 3));
    //   });
    // }
  }
