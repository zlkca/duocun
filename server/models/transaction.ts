import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";
import { Account, IAccount } from "./account";
import moment from 'moment';
import { Merchant } from "./merchant";

const CASH_ID = '5c9511bb0851a5096e044d10';
const CASH_NAME = 'Cash';
const BANK_ID = '5c95019e0851a5096e044d0c';
const BANK_NAME = 'TD Bank';

export interface ITransaction {
  _id?: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  orderId?: string;
  type?: string;
  action: string;
  amount: number;
  note?: string;
  fromBalance?: number;
  toBalance?: number;

  delivered?: string;
  created?: string;
  modified?: string;
}

export class Transaction extends Model {
  private accountModel: Account;
  private merchantModel: Merchant;

  constructor(dbo: DB) {
    super(dbo, 'transactions');
    this.accountModel = new Account(dbo);
    this.merchantModel = new Merchant(dbo);
  }

  // use in admin
  list(req: Request, res: Response) {
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    let q = query;
    if (q) {
      if (q.where) {
        q = query.where;
      }
    } else {
      q = {};
    }

    if (q && q.fromId && typeof q.fromId === 'string' && q.fromId.length === 24) {
      q.fromId = new ObjectID(q.fromId);
    } else if (q.fromId && q.fromId.hasOwnProperty('$in')) {
      let a = q.fromId['$in'];
      const arr: any[] = [];
      a.map((id: string) => {
        arr.push(new ObjectID(id));
      });

      q.fromId = { $in: arr };
    }

    if (q && q.toId && typeof q.toId === 'string' && q.toId.length === 24) {
      q.toId = new ObjectID(q.toId);
    } else if (q.toId && q.toId.hasOwnProperty('$in')) {
      let a = q.toId['$in'];
      const arr: any[] = [];
      a.map((id: string) => {
        arr.push(new ObjectID(id));
      });

      q.toId = { $in: arr };
    }

    if (q && q.hasOwnProperty('$or')) {
      q['$or'].map((it: any) => {
        if (it && it.hasOwnProperty('fromId') && typeof it.fromId === 'string' && it.fromId.length === 24) {
          it.fromId = new ObjectID(it.fromId);
        }
        if (it && it.hasOwnProperty('toId') && typeof it.toId === 'string' && it.toId.length === 24) {
          it.toId = new ObjectID(it.toId);
        }
      });
    }

    const params = [
      { $lookup: { from: 'users', localField: 'fromId', foreignField: '_id', as: 'from' } },
      { $unwind: '$from' },
      { $lookup: { from: 'users', localField: 'toId', foreignField: '_id', as: 'to' } },
      { $unwind: '$to' }
    ];

    this.join(params, q).then((rs: any) => {
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  doInsertOne(tr: ITransaction): Promise<ITransaction> {
    const fromId: string = tr.fromId;
    const toId: string = tr.toId;
    const amount: number = tr.amount;

    return new Promise((resolve, reject) => {
      const accountQuery = { _id: { $in: [fromId, toId] } };
      this.accountModel.find(accountQuery).then((accounts: IAccount[]) => {
        const fromAccount: any = accounts.find(x => x._id.toString() === fromId);
        const toAccount: any = accounts.find(x => x._id.toString() === toId);

        if (fromAccount && toAccount) {
          tr.fromBalance = Math.round((fromAccount.balance + amount) * 100) / 100;
          tr.toBalance = Math.round((toAccount.balance - amount) * 100) / 100;

          this.insertOne(tr).then((x) => {
            const updates = [
              { query: { _id: fromId }, data: { balance: tr.fromBalance } },
              { query: { _id: toId }, data: { balance: tr.toBalance } }
            ];

            this.accountModel.bulkUpdate(updates).then((r) => {
              resolve(x);
            });
          });
        } else {
          // if (accounts[0]) {
          //   console.log("From:" + accounts[0]._id.toString());
          // }

          // if (accounts[1]) {
          //   console.log("To:" + accounts[1]._id.toString());
          // }
          resolve();
        }
      });
    });
  }


  create(req: Request, res: Response) {
    if (req.body instanceof Array) {
      this.insertMany(req.body).then((rs: any[]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(rs, null, 3));
      });
    } else {
      const tr = req.body;
      this.doInsertOne(tr).then(savedTr => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(savedTr, null, 3));
      });
    }
  }


  // doRemoveOne(tr: ITransaction) {
  //   const fromId: string = tr.fromId;
  //   const toId: string = tr.toId;
  //   const amount: number = tr.amount;

  //   return new Promise((resolve, reject) => {
  //     const accountQuery = { _id: { $in: [fromId, toId] } };
  //     this.accountModel.find(accountQuery).then((accounts: IAccount[]) => {
  //       const fromAccount: any = accounts.find(x => x._id.toString() === fromId);
  //       const toAccount: any = accounts.find(x => x._id.toString() === toId);

  //       if (fromAccount && toAccount) {
  //         tr.fromBalance = Math.round((fromAccount.balance - amount) * 100) / 100;
  //         tr.toBalance = Math.round((toAccount.balance + amount) * 100) / 100;

  //         this.RemoveOne(tr).then((x) => {
  //           const updates = [
  //             { query: { _id: fromId }, data: { balance: tr.fromBalance } },
  //             { query: { _id: toId }, data: { balance: tr.toBalance } }
  //           ];

  //           this.accountModel.bulkUpdate(updates).then((r) => {
  //             resolve(x);
  //           });
  //         });
  //       } else {
  //         if (accounts[0]) {
  //           console.log("From:" + accounts[0]._id.toString());
  //         }

  //         if (accounts[1]) {
  //           console.log("To:" + accounts[1]._id.toString());
  //         }
  //         resolve();
  //       }
  //     });
  //   });
  // }

  doGetSales() {
    const q = {
      action: {
        $in: [
          'client pay cash',
          'client pay by card',
          'client pay by wechat'
        ]
      }
    };

    return new Promise((resolve, reject) => {
      this.find(q).then((trs: ITransaction[]) => {
        let sales = { cash: 0, card: 0, wechat: 0, total: 0 };
        trs.map((tr: ITransaction) => {
          if (tr.action === 'client pay cash') {
            sales.cash += tr.amount;
          } else if (tr.action === 'client pay by card') {
            sales.card += tr.amount;
          } else if (tr.action === 'client pay by wechat') {
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
      res.end(JSON.stringify(sales, null, 3));
    });
  }

  doGetCost() {
    const q = {
      action: {
        $in: [
          'duocun order from merchant',
          'pay salary',
          'pay office rent',
          'refund expense'
        ]
      }
    };

    return new Promise((resolve, reject) => {
      this.find(q).then((trs: ITransaction[]) => {
        let cost = { merchant: 0, salary: 0, officeRent: 0, refund: 0, total: 0 };
        trs.map((tr: ITransaction) => {
          if (tr.action === 'duocun order from merchant') {
            cost.merchant += tr.amount;
          } else if (tr.action === 'pay salary') {
            cost.salary += tr.amount;
          } else if (tr.action === 'pay office rent') {
            cost.officeRent += tr.amount;
          } else if (tr.action === 'refund expense') {
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
      res.end(JSON.stringify(cost, null, 3));
    });
  }

  getMerchantPay(req: Request, res: Response) {
    this.doGetMerchantPay().then(amount => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(amount, null, 3));
    });
  }

  getSalary(req: Request, res: Response) {
    this.doGetSalary().then(amount => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(amount, null, 3));
    });
  }

  doGetMerchantPay() {
    const q = { action: 'duocun order from merchant' };

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
    const q = { action: 'pay salary' };

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


  saveTransactionsForPlaceOrder(orderId: string, merchantId: string, merchantName: string, clientId: string, clientName: string,
    cost: number, total: number, delivered?: string) {

    return new Promise((resolve, reject) => {
      this.merchantModel.findOne({ _id: merchantId }).then(m => {
        const merchantAccountId = m.accountId.toString();

        const t1: ITransaction = {
          fromId: merchantAccountId,
          fromName: merchantName,
          toId: CASH_ID,
          toName: clientName,
          action: 'duocun order from merchant',
          amount: Math.round(cost * 100) / 100,
          orderId: orderId,
          delivered: delivered,
        };

        const t2: ITransaction = {
          fromId: CASH_ID,
          fromName: merchantName,
          toId: clientId,
          toName: clientName,
          amount: Math.round(total * 100) / 100,
          action: 'client order from duocun',
          orderId: orderId,
          delivered: delivered,
        };

        this.doInsertOne(t1).then((x) => {
          this.doInsertOne(t2).then((y) => {
            resolve();
          });
        });
      });
    });
  }


  saveTransactionsForRemoveOrder(merchantId: string, merchantName: string, clientId: string, clientName: string,
    cost: number, total: number, delivered: string) {

    return new Promise((resolve, reject) => {
      this.merchantModel.findOne({ _id: merchantId }).then(m => {
        const merchantAccountId = m.accountId.toString();
        const t1: ITransaction = {
          fromId: CASH_ID,
          fromName: clientName,
          toId: merchantAccountId,
          toName: merchantName,
          action: 'duocun cancel order from merchant',
          amount: Math.round(cost * 100) / 100,
          delivered: delivered
        };

        const t2: ITransaction = {
          fromId: clientId,
          fromName: clientName,
          toId: CASH_ID,
          toName: merchantName,
          amount: Math.round(total * 100) / 100,
          action: 'client cancel order from duocun',
          delivered: delivered
        };

        this.doInsertOne(t1).then((x) => {
          this.doInsertOne(t2).then((y) => {
            resolve();
          });
        });
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
  //     res.end(JSON.stringify(x, null, 3));
  //   });
  // }

  doAddCredit(clientId: string, clientName: string, total: number, paymentMethod: string, note: string) {
    if (paymentMethod === 'card' || paymentMethod === 'WECHATPAY') {
      const t1: ITransaction = {
        fromId: clientId,
        fromName: clientName,
        toId: BANK_ID,
        toName: BANK_NAME,
        amount: Math.round(total * 100) / 100,
        action: 'client add credit by ' + paymentMethod,
        note: note
      };
      return new Promise((resolve, reject) => {
        this.doInsertOne(t1).then((x) => {
          resolve(x);
        });
      });
    } else {
      const t2: ITransaction = {
        fromId: clientId,
        fromName: clientName,
        toId: CASH_ID,
        toName: CASH_NAME,
        amount: Math.round(total * 100) / 100,
        action: 'client add credit by cash',
        note: note
      };

      return new Promise((resolve, reject) => {
        this.doInsertOne(t2).then((x) => {
          resolve(x);
        });
      });
    }
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

  // tools
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

    this.find({ fromId: '5cad44629687ac4a075e2f42', action: { $in: actions } }).then(trs1 => {
      const datas: any[] = [];
      trs1.map((t: any) => {
        datas.push({
          query: { _id: t._id },
          data: { fromId: '5de520d9dfb6771fe8ea0f60', fromName: 'li2' }
        });
      });


      this.find({ toId: '5cad44629687ac4a075e2f42', action: { $in: actions } }).then(trs2 => {
        trs2.map((t: any) => {
          datas.push({
            query: { _id: t._id },
            data: { toId: '5de520d9dfb6771fe8ea0f60', toName: 'li2' }
          });
        });

        res.setHeader('Content-Type', 'application/json');
        if (datas && datas.length > 0) {
          this.bulkUpdate(datas).then(() => {
            res.end(JSON.stringify('success', null, 3));
          });
        } else {
          res.end(JSON.stringify(null, null, 3));
        }

      });
    });
  }
}