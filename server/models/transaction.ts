import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";
import { Account, IAccount } from "./account";


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
  type?: string;
  action: string;
  amount: number;
  note?: string;
  fromBalance?: number;
  toBalance?: number;
  created?: string;
  modified?: string;
}

export class Transaction extends Model {
  private accountModel: Account;
  constructor(dbo: DB) {
    super(dbo, 'transactions');
    this.accountModel = new Account(dbo);
  }

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
          tr.fromBalance = Math.round((fromAccount.balance - amount) * 100) / 100;
          tr.toBalance = Math.round((toAccount.balance + amount) * 100) / 100;

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
    const q = {action: 'duocun order from merchant'};

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
    const q = {action: 'pay salary'};

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
  

  // This request will insert 3 transactions, client -> TD (paid), Merchant -> Cash (cost), Cash -> Client (total)
  saveTransactionForOrder(req: Request, res: Response){
      const merchantId = req.body.merchantId;
      const merchantName = req.body.merchantName;
      const clientId = req.body.clientId;
      const clientName = req.body.clientName;
      const cost = req.body.cost;
      const total = req.body.total;
      const action = req.body.action;
      const paid = req.body.paid;

      const tr: ITransaction = {
        fromId: clientId,
        fromName: clientName,
        toId: BANK_ID,
        toName: BANK_NAME,
        action: action,
        amount: Math.round(paid * 100) / 100,
      };

      this.insertOne(tr).then(t => {
        this.saveTransactionsForPlaceOrder(merchantId, merchantName, clientId, clientName, cost, total).then(()  => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(t, null, 3));
        });
      });
  }

  saveTransactionsForPlaceOrder(merchantId: string, merchantName: string, clientId: string, clientName: string,
    cost: number, total: number){
    const t1: ITransaction = {
      fromId: merchantId,
      fromName: merchantName,
      toId: CASH_ID,
      toName: clientName,
      action: 'duocun order from merchant',
      amount: Math.round(cost * 100) / 100,
    };

    const t2: ITransaction = {
      fromId: CASH_ID,
      fromName: merchantName,
      toId: clientId,
      toName: clientName,
      amount: Math.round(total * 100) / 100,
      action: 'client order from duocun'
    };

    return new Promise((resolve, reject) => {
      this.doInsertOne(t1).then((x) => {
        this.doInsertOne(t2).then((y) => {
          resolve();
        });
      });
    });
  }

  saveTransactionsForRemoveOrder(merchantId: string, merchantName: string, clientId: string, clientName: string,
    cost: number, total: number){
    const t1: ITransaction = {
      fromId: CASH_ID,
      fromName: clientName,
      toId: merchantId,
      toName: merchantName,
      action: 'duocun cancel order from merchant',
      amount: Math.round(cost * 100) / 100,
    };

    const t2: ITransaction = {
      fromId: clientId,
      fromName: clientName,
      toId: CASH_ID,
      toName: merchantName,
      amount: Math.round(total * 100) / 100,
      action: 'client cancel order from duocun'
    };

    return new Promise((resolve, reject) => {
      this.doInsertOne(t1).then((x) => {
        this.doInsertOne(t2).then((y) => {
          resolve();
        });
      });
    });
  }
}