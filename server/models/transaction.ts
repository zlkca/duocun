import { DB } from "../db";
import { Model } from "./model";
import { ObjectID, ObjectId } from "mongodb";
import { Request, Response } from "express";
import { Account, IAccount } from "./account";
import moment from 'moment';
import { IOrderItem, PaymentMethod } from "./order";
import { EventLog } from "./event-log";
import { ResponseStatus } from "./client-payment";

import fs from 'fs';

const CASH_BANK_ID = '5c9511bb0851a5096e044d10';
const CASH_BANK_NAME = 'Cash Bank';
const TD_BANK_ID = '5c95019e0851a5096e044d0c';
const TD_BANK_NAME = 'TD Bank';
const SNAPPAY_BANK_ID = '5e60139810cc1f34dea85349';
const SNAPPAY_BANK_NAME = 'SnapPay Bank';



export const TransactionAction = {
  PAY_DRIVER_CASH: { code: 'PDCH', name: 'client pay driver cash' }, // 'client pay cash', 'pay cash'
  PAY_BY_CARD: { code: 'PC', name: 'client pay by card' }, // 'pay by card'
  PAY_BY_WECHAT: { code: 'PW', name: 'client pay by wechat' }, // 'pay by wechat'

  PAY_MERCHANT_CASH: { code: 'PMCH', name: 'driver pay merchant cash' }, // pay merchant
  PAY_MERCHANT_BY_CARD: { code: 'PMC', name: 'driver pay merchant by card' }, // pay merchant by card
  PAY_MERCHANT_BY_WECHAT: { code: 'PMW', name: 'driver pay merchant by wechat' }, // pay merchant by wechat

  PAY_SALARY: { code: 'PS', name: 'pay salary' },
  PAY_OFFICE_RENT: { code: 'POR', name: 'pay office rent' },

  ORDER_FROM_MERCHANT: { code: 'OFM', name: 'duocun order from merchant' },
  ORDER_FROM_DUOCUN: { code: 'OFD', name: 'client order from duocun' },
  CANCEL_ORDER_FROM_MERCHANT: { code: 'CFM', name: 'duocun cancel order from merchant' },
  CANCEL_ORDER_FROM_DUOCUN: { code: 'CFD', name: 'client cancel order from duocun' },

  REFUND_EXPENSE: { code: 'RE', name: 'refund expense' },
  REFUND_CLIENT: { code: 'RC', name: 'refund client' },
  ADD_CREDIT_BY_CARD: { code: 'ACC', name: 'client add credit by card' },
  ADD_CREDIT_BY_WECHAT: { code: 'ACW', name: 'client add credit by WECHATPAY' },
  ADD_CREDIT_BY_CASH: { code: 'ACCH', name: 'client add credit by cash' },
  TRANSFER: { code: 'T', name: 'transfer' },
  BUY_MATERIAL: { code: 'BM', name: 'buy material' }, // buy drinks
  BUY_EQUIPMENT: { code: 'BE', name: 'buy equipment' },
  BUY_ADVERTISEMENT: { code: 'BA', name: 'buy advertisement' },
  OTHER_EXPENSE: { code: 'OE', name: 'other expense' },
  TEST: { code: 'TEST', name: 'test' }
};


export interface ITransaction {
  _id?: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  paymentId?: string;
  orderId?: string;
  orderType?: string;
  items?: IOrderItem[];
  type?: string;
  actionCode: string;
  amount: number;
  note?: string;
  fromBalance?: number;
  toBalance?: number;

  delivered?: string;
  created?: string;
  modified?: string;
}

export interface IDbTransaction {
  _id: ObjectId;
  fromId: ObjectId;
  fromName: string;
  toId: ObjectId;
  toName: string;
  actionCode: string;
  amount: number;
  fromBalance: number;
  toBalance: number;

  type?: string;
  note?: string;

  delivered?: string;
  created?: string;
  modified?: string;
}

export class Transaction extends Model {
  private accountModel: Account;
  eventLogModel: EventLog;
  constructor(dbo: DB) {
    super(dbo, 'transactions');
    this.accountModel = new Account(dbo);
    this.eventLogModel = new EventLog(dbo);
  }

  // v2
  async joinFindV2(query: any, fields: string[] = []) {
    const ts = await this.find(query, fields);
    // if (fields.indexOf('items') !== -1) {
    // const ids = ts.map((t: any) => t.orderId);
    // const orders = await this.orderModel.joinFindV2({ _id: { $in: ids } }, ['_id', 'items']);
    // const orderMap: any = {};
    // orders.map(order => { orderMap[order._id.toString()] = order.items; });
    // ts.map((t: any) => t.items = orderMap[t.orderId.toString()]);
    // // }
    return ts;
  }

  listV2(req: Request, res: Response) {
    let query = null;
    let fields;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    if (req.headers && req.headers.fields && typeof req.headers.fields === 'string') {
      fields = (req.headers && req.headers.fields) ? JSON.parse(req.headers.fields) : null;
    }

    this.joinFindV2(query).then((rs: IDBTransaction[]) => {
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
  // v1
  // use in admin, $in
  list(req: Request, res: Response) {
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    this.find(query).then((rs: IDBTransaction[]) => {
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  doInsertOne(tr: ITransaction): Promise<IDbTransaction> {
    const fromId: string = tr.fromId; // must be account id
    const toId: string = tr.toId;     // must be account id
    const amount: number = tr.amount;

    return new Promise((resolve, reject) => {
      const accountQuery = { _id: { $in: [fromId, toId] } };
      this.accountModel.find(accountQuery).then((accounts: IAccount[]) => {
        const fromAccount: any = accounts.find(x => x._id.toString() === fromId);
        const toAccount: any = accounts.find(x => x._id.toString() === toId);

        if (fromAccount && toAccount) {
          tr.fromBalance = Math.round((fromAccount.balance + amount) * 100) / 100;
          tr.toBalance = Math.round((toAccount.balance - amount) * 100) / 100;

          this.insertOne(tr).then((x: IDbTransaction) => {
            const updates = [
              { query: { _id: fromId }, data: { balance: tr.fromBalance } },
              { query: { _id: toId }, data: { balance: tr.toBalance } }
            ];

            this.accountModel.bulkUpdate(updates).then((r) => {
              resolve(x);
            });
          });
        } else {
          // const eventLog = {
          //   accountId: fromId,
          //   type: 'debug',
          //   code: '',
          //   decline_code: '',
          //   message: 'fromId: ' + tr.fromId + ' toId: ' + tr.toId + ' actionCode: ' + tr.actionCode,
          //   created: moment().toISOString()
          // }
          // this.eventLogModel.insertOne(eventLog).then(() => {
          resolve();
          // });
        }
      });
    });
  }

  create(req: Request, res: Response) {
    if (req.body instanceof Array) {
      this.insertMany(req.body).then((rs: any[]) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rs, null, 3));
      });
    } else {
      const tr = req.body;
      this.doInsertOne(tr).then(savedTr => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(savedTr, null, 3));
      });
    }
  }


  saveTransactionsForPlaceOrder(orderId: string, orderType: string, merchantAccountId: string, merchantName: string,
    clientId: string, clientName: string, cost: number, total: number, delivered: string): Promise<string> {

    return new Promise((resolve, reject) => {
      const t1: ITransaction = {
        fromId: merchantAccountId,
        fromName: merchantName,
        toId: CASH_BANK_ID,
        toName: clientName,
        actionCode: TransactionAction.ORDER_FROM_MERCHANT.code, // 'duocun order from merchant',
        amount: Math.round(cost * 100) / 100,
        orderId: orderId,
        orderType: orderType,
        delivered: delivered,
      };

      const t2: ITransaction = {
        fromId: CASH_BANK_ID,
        fromName: merchantName,
        toId: clientId,
        toName: clientName,
        amount: Math.round(total * 100) / 100,
        actionCode: TransactionAction.ORDER_FROM_DUOCUN.code, // 'client order from duocun',
        orderId: orderId,
        orderType: orderType,
        delivered: delivered,
      };

      this.doInsertOne(t1).then((x) => {
        this.doInsertOne(t2).then((y) => {
          resolve();
        });
      });
    });
  }


  saveTransactionsForRemoveOrder(orderId: string, merchantAccountId: string, merchantName: string, clientId: string, clientName: string,
    cost: number, total: number, delivered: string, items: IOrderItem[]) {

    return new Promise((resolve, reject) => {
      const t1: ITransaction = {
        fromId: CASH_BANK_ID,
        fromName: clientName,
        toId: merchantAccountId,
        toName: merchantName,
        actionCode: TransactionAction.CANCEL_ORDER_FROM_MERCHANT.code, // 'duocun cancel order from merchant',
        amount: Math.round(cost * 100) / 100,
        orderId: orderId,
        items: items,
        delivered: delivered
      };

      const t2: ITransaction = {
        fromId: clientId,
        fromName: clientName,
        toId: CASH_BANK_ID,
        toName: merchantName,
        amount: Math.round(total * 100) / 100,
        actionCode: TransactionAction.CANCEL_ORDER_FROM_DUOCUN.code, // 'client cancel order from duocun',
        orderId: orderId,
        delivered: delivered
      };

      this.doInsertOne(t1).then((x) => {
        this.doInsertOne(t2).then((y) => {
          resolve();
        });
      });
    });
  }

  doGetSales() {
    const q = {
      actionCode: {
        $in: [
          // 'client pay cash',
          // 'client pay by card',
          // 'client pay by wechat'
          TransactionAction.PAY_DRIVER_CASH.code, // 'duocun order from merchant',
          TransactionAction.PAY_BY_CARD.code, // 'pay salary',
          TransactionAction.PAY_BY_WECHAT.code, // 'pay office rent',
        ]
      }
    };

    return new Promise((resolve, reject) => {
      this.find(q).then((trs: ITransaction[]) => {
        let sales = { cash: 0, card: 0, wechat: 0, total: 0 };
        trs.map((tr: ITransaction) => {
          if (tr.actionCode === TransactionAction.PAY_DRIVER_CASH.code) { // 'client pay cash') {
            sales.cash += tr.amount;
          } else if (tr.actionCode === TransactionAction.PAY_BY_CARD.code) { // 'client pay by card') {
            sales.card += tr.amount;
          } else if (tr.actionCode === TransactionAction.PAY_BY_WECHAT.code) { // 'client pay by wechat') {
            sales.wechat += tr.amount;
          }
        });

        sales.total = sales.cash + sales.card + sales.wechat;
        resolve(sales);
      });
    });
  }

  getSales(req: Request, res: Response) {
    this.doGetSales().then(sales => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(sales, null, 3));
    });
  }

  doGetCost() {
    const q = {
      actionCode: {
        $in: [
          TransactionAction.ORDER_FROM_MERCHANT.code, // 'duocun order from merchant',
          TransactionAction.PAY_SALARY.code, // 'pay salary',
          TransactionAction.PAY_OFFICE_RENT.code, // 'pay office rent',
          TransactionAction.REFUND_EXPENSE.code // 'refund expense'
        ]
      }
    };

    return new Promise((resolve, reject) => {
      this.find(q).then((trs: ITransaction[]) => {
        let cost = { merchant: 0, salary: 0, officeRent: 0, refund: 0, total: 0 };
        trs.map((tr: ITransaction) => {
          if (tr.actionCode === TransactionAction.ORDER_FROM_MERCHANT.code) { // 'duocun order from merchant'
            cost.merchant += tr.amount;
          } else if (tr.actionCode === TransactionAction.PAY_SALARY.code) { // 'pay salary') {
            cost.salary += tr.amount;
          } else if (tr.actionCode === TransactionAction.PAY_OFFICE_RENT.code) { // 'pay office rent') {
            cost.officeRent += tr.amount;
          } else if (tr.actionCode === TransactionAction.REFUND_EXPENSE.code) { // 'refund expense') {
            cost.refund += tr.amount;
          }
        });

        cost.total = cost.merchant + cost.salary + cost.officeRent + cost.refund;
        resolve(cost);
      });
    });
  }

  getCost(req: Request, res: Response) {
    this.doGetCost().then(cost => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(cost, null, 3));
    });
  }

  getMerchantPay(req: Request, res: Response) {
    this.doGetMerchantPay().then(amount => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(amount, null, 3));
    });
  }

  getSalary(req: Request, res: Response) {
    this.doGetSalary().then(amount => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(amount, null, 3));
    });
  }

  doGetMerchantPay() {
    const q = { actionCode: TransactionAction.ORDER_FROM_MERCHANT }; // 'duocun order from merchant' };

    return new Promise((resolve, reject) => {
      this.find(q).then((trs: ITransaction[]) => {
        let amount = 0;
        trs.map((tr: ITransaction) => {
          amount += tr.amount;
        });

        resolve(amount);
      });
    });
  }

  doGetSalary() {
    const q = { actionCode: TransactionAction.PAY_SALARY }; // 'pay salary' };

    return new Promise((resolve, reject) => {
      this.find(q).then((trs: ITransaction[]) => {
        let amount = 0;
        trs.map((tr: ITransaction) => {
          amount += tr.amount;
        });

        resolve(amount);
      });
    });
  }




  // snappayAddCredit(req: Request, res: Response) {
  //   const clientId = req.body.clientId;
  //   const clientName = req.body.clientName;
  //   const total = +req.body.total;
  //   const paymentMethod = req.body.paymentMethod;
  //   const note = req.body.note;

  //   this.doAddCredit(clientId, clientName, total, paymentMethod, note).then(x => {
  //     res.setHeader('Content-Type', 'application/json');
  //     res.send(JSON.stringify(x, null, 3));
  //   });
  // }

  doAddCredit(fromId: string, fromName: string, total: number, paymentMethod: string, note: string): Promise<IDbTransaction> {
    let toId = '';
    let toName = '';
    let actionCode = '';
    const amount = Math.round(total * 100) / 100;

    if (paymentMethod === PaymentMethod.CREDIT_CARD) {
      actionCode = TransactionAction.ADD_CREDIT_BY_CARD.code;
      toId = TD_BANK_ID;
      toName = TD_BANK_NAME;
    } else if (paymentMethod === PaymentMethod.WECHAT) {
      actionCode = TransactionAction.ADD_CREDIT_BY_WECHAT.code;
      toId = SNAPPAY_BANK_ID;
      toName = SNAPPAY_BANK_NAME;
    } else { // cash + prepay
      toId = CASH_BANK_ID;
      toName = CASH_BANK_NAME;
      actionCode = TransactionAction.ADD_CREDIT_BY_CASH.code;
    }

    const t: ITransaction = { fromId, fromName, toId, toName, amount, actionCode, note };

    return new Promise((resolve, reject) => {
      this.doInsertOne(t).then((x) => {
        resolve(x); // x could be null
      });
    });

  }

  loadPage(req: Request, res: Response) {
    const itemsPerPage = +req.params.itemsPerPage;
    const currentPageNumber = +req.params.currentPageNumber;

    let query = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    this.find(query).then((rs: any) => {
      const arrSorted = rs.sort((a: any, b: any) => {
        const aMoment = moment(a.created);
        const bMoment = moment(b.created); // .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        if (aMoment.isAfter(bMoment)) {
          return -1;
        } else {
          return 1;
        }
      });

      const start = (currentPageNumber - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const len = arrSorted.length;
      const arr = arrSorted.slice(start, end);

      res.setHeader('Content-Type', 'application/json');
      if (arr && arr.length > 0) {
        res.send(JSON.stringify({ total: len, transactions: arr }, null, 3));
      } else {
        res.send(JSON.stringify({ total: len, transactions: [] }, null, 3));
      }

    });
  }

  groupByDelivered(items: ITransaction[]) {
    const groups: any = {};
    items.map(it => {
      let delivered: any = null;
      if (it.hasOwnProperty('delivered')) {
        delivered = moment(it.delivered);
        const dt: any = Object.keys(groups).find(x => moment(x).isSame(delivered, 'day'));
        if (dt) {
          groups[dt].push(it);
        } else {
          groups[delivered.toISOString()] = [it];
        }
      } else {
        console.log('No delivered Transaction:' + it._id);
      }
    });
    return groups;
  }

  getMerchantDescription(t: any, merchantAccountId: string, lang: string) {
    if (t.items && t.items.length > 0) {
      if (lang === 'en') {
        return 'client cancel order';
      } else {
        return '客户撤销订单';
      }
    } else {
      return t.toId === merchantAccountId ? t.fromName : t.toName;
    }
  }

  getMerchantBalance(req: Request, res: Response) {
    let query: any = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    const merchantAccountId = query.id;
    const lang = query.lang;

    this.doGetMerchantBalance(merchantAccountId, lang).then((arr: any[]) => {
      res.setHeader('Content-Type', 'application/json');
      if (arr && arr.length > 0) {
        res.send(JSON.stringify(arr, null, 3));
      } else {
        res.send(JSON.stringify([], null, 3));
      }
    });
  }

  doGetMerchantBalance(merchantAccountId: string, lang: string): Promise<any[]> {
    const qCredit = { fromId: merchantAccountId };
    const qDebit = { toId: merchantAccountId };

    return new Promise((resolve, reject) => {
      this.find(qCredit).then(credits => {
        this.find(qDebit).then(debits => {
          const list: any = [];
          const receivables: any = this.groupByDelivered(credits);
          Object.keys(receivables).map((dt: string) => {
            const its: any[] = receivables[dt];
            let amount = 0;
            its.map((it: any) => { amount += it.amount; });
            list.push({ created: dt, description: '', type: 'credit', receivable: amount, received: 0, balance: 0, items: null });
          });

          debits.map((t: any) => {
            const dt = t.delivered ? t.delivered : t.created;
            const description = this.getMerchantDescription(t, merchantAccountId, lang);
            list.push({
              created: dt, description: description, type: 'debit', receivable: 0, received: t.amount, balance: 0,
              items: t.items ? t.items : null
            });
          });

          const rs: any[] = list.sort((a: any, b: any) => {
            const aMoment = moment(a.created);
            const bMoment = moment(b.created);
            if (aMoment.isSame(bMoment, 'day')) {
              if (a.type === 'debit') {
                return 1;
              } else {
                if (aMoment.isAfter(bMoment)) {
                  return 1; // a to bottom
                } else {
                  return -1;
                }
              }
            } else {
              if (aMoment.isAfter(bMoment)) {
                return 1;
              } else {
                return -1;
              }
            }
          });

          resolve(rs);
        });
      });
    });
  }


  // tools
  // fix account
  changeAccount(req: Request, res: Response) {

    const actions = [
      // 'client order from duocun',
      'duocun order from merchant',
      'client pay cash',
      'pay merchant',
      // 'client pay by card',
      // 'client pay by wechat',
      'transfer',
      'pay salary',
      'indemnity to expense',
      'refund client',
      'refund expense',
      'pay office rent',
      'buy drinks',
      'buy eqquipment',
      'advertisement',
      'other expense'
    ];

    // this.find({ fromId: '5cad44629687ac4a075e2f42', action: { $in: actions } }).then(trs1 => {
    //   const datas: any[] = [];
    //   trs1.map((t: any) => {
    //     datas.push({
    //       query: { _id: t._id },
    //       data: { fromId: '5de520d9dfb6771fe8ea0f60', fromName: 'li2' }
    //     });
    //   });


    //   this.find({ toId: '5cad44629687ac4a075e2f42', action: { $in: actions } }).then(trs2 => {
    //     trs2.map((t: any) => {
    //       datas.push({
    //         query: { _id: t._id },
    //         data: { toId: '5de520d9dfb6771fe8ea0f60', toName: 'li2' }
    //       });
    //     });

    //     res.setHeader('Content-Type', 'application/json');
    //     if (datas && datas.length > 0) {
    //       this.bulkUpdate(datas).then(() => {
    //         res.send(JSON.stringify('success', null, 3));
    //       });
    //     } else {
    //       res.send(JSON.stringify(null, null, 3));
    //     }

    //   });
    // });
  }

  fixCancelTransactions(req: Request, res: Response) {
    // const q1 = { action: {$in: ['client cancel order from duocun', 'duocun cancel order from merchant']}, delivered:null};
    // this.find(q1).then(t1s => {
    //   const datas: any[] = [];
    //   t1s.map((t1: ITransaction) => {
    //     const m = moment(t1.created).set({ hour: 11, minute: 20, second: 0, millisecond: 0 });
    //     datas.push({
    //       query: { _id: t1._id },
    //       data: { delivered: m.toISOString() }
    //     });
    //   });
    //   this.bulkUpdate(datas).then(() => {
    //     res.setHeader('Content-Type', 'application/json');
    //     res.send(JSON.stringify('success', null, 3));
    //   });
    // });
  }

  // v2 api
  updateBalanceList(accountIds: string[]){
    const self = this;
    this.find({}).then(ts => {
      accountIds.map((id: string) => {
        setTimeout(() => {
          self.updateBalanceByAccountId(id, ts).then(() => {
            
          });
        }, 500);
      });
    });
  }

  // const trs = transactions.filter(t => t.fromId.toString() === accountId || t.toId.toString() === accountId);
  async updateBalanceByAccountId(accountId: string, trs: ITransaction[]) {
    if (trs && trs.length > 0) {
      let balance = 0;
      const list = trs.sort((a: any, b: any) => {
        const aMoment = moment(a.created);
        const bMoment = moment(b.created);
        if (aMoment.isSame(bMoment, 'day')) {
          if (aMoment.isAfter(bMoment)) {
            return 1; // a to bottom
          } else {
            return -1;
          }
        } else {
          if (aMoment.isAfter(bMoment)) {
            return 1;
          } else {
            return -1;
          }
        }
      });

      const datas: any[] = [];
      list.map((t: ITransaction) => {
        const oId: any = t._id;
        if (t.fromId.toString() === accountId) {
          balance += t.amount;
          datas.push({
            query: { _id: oId.toString() },
            data: {
              fromBalance: Math.round(balance * 100) / 100
            }
          });
        } else if (t.toId.toString() === accountId) {
          balance -= t.amount;
          datas.push({
            query: { _id: oId.toString() },
            data: {
              toBalance: Math.round(balance * 100) / 100,
            }
          });
        }
      });

      balance = Math.round(balance * 100) / 100;
      await this.bulkUpdate(datas);
      await this.accountModel.updateOne({ _id: accountId }, { balance: balance });
      return;
    }
  }


  // Tools v2
  sortTransactions(trs: any[]) {
    return trs.sort((a: any, b: any) => {
      const aMoment = moment(a.created);
      const bMoment = moment(b.created);
      if (aMoment.isSame(bMoment, 'day')) {
        if (aMoment.isAfter(bMoment)) {
          return 1; // a to bottom
        } else {
          return -1;
        }
      } else {
        if (aMoment.isAfter(bMoment)) {
          return 1;
        } else {
          return -1;
        }
      }
    });
  }

  // ----------------------------------------------------
  // update single account
  updateBalance(accountId: string) {
    return new Promise((resolve, reject) => {
      const q = { '$or': [{ fromId: accountId }, { toId: accountId }] };
      const datas: any[] = [];

      this.find(q).then(trs => {

        if (trs && trs.length > 0) {
          let balance = 0;
          let list = this.sortTransactions(trs);

          list.map((t: ITransaction) => {
            const oId: any = t._id;
            if (t.fromId.toString() === accountId) {
              balance += t.amount;
              datas.push({
                query: { _id: oId.toString() },
                data: {
                  fromBalance: Math.round(balance * 100) / 100
                }
              });
            } else if (t.toId.toString() === accountId) {
              balance -= t.amount;
              datas.push({
                query: { _id: oId.toString() },
                data: {
                  toBalance: Math.round(balance * 100) / 100,
                }
              });
            }
          });

          balance = Math.round(balance * 100) / 100;

          this.bulkUpdate(datas).then(() => {
            this.accountModel.updateOne({ _id: accountId }, { balance: balance }).then(() => {
              resolve({ status: ResponseStatus.SUCCESS });
            });
          });
        } else {
          resolve({ status: ResponseStatus.FAIL });
        }
      });
    });
  }

  updateAccount(req: Request, res: Response) {
    const accountId = req.body.accountId;

    this.updateBalance(accountId).then((r) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(r, null, 3));
    });
  }

  updateBalances(req: Request, res: Response) {
    const self = this;
    this.accountModel.find({}).then(accounts => {
      this.find({}).then(ts => {
        accounts.map((a: IAccount) => {
          setTimeout(() => {
            self.updateBalanceByAccountId(a._id.toString(), ts).then(() => {

            });
          }, 500);
        });

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify('success', null, 3));
      });
    });
  }



}