import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import moment from "moment";
import { BulkWriteOpResultObject } from "../../node_modules/@types/mongodb";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";
import { IOrder } from "../models/order";

export interface IBalance {
  _id: string;
  accountId: string;
  accountName: string;
  amount: number;
  created: Date;
  modified: Date;
}

export class Balance extends Model {
  paymentEntity: Entity;
  orderEntity: Entity;
  transactionEntity: Entity;

  constructor(dbo: DB) {
    super(dbo, 'balances');
    this.orderEntity = new Entity(dbo, 'orders');
    this.transactionEntity = new Entity(dbo, 'transactions');
    this.paymentEntity = new Entity(dbo, 'client_payments');
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

    if (q && q.accountId && typeof q.accountId === 'string' && q.accountId.length === 24) {
      q.accountId = new ObjectID(q.accountId);
    } else if (q.accountId && q.accountId.hasOwnProperty('$in')) {
      let a = q.accountId['$in'];
      const arr: any[] = [];
      a.map((id: string) => {
        arr.push(new ObjectID(id));
      });

      q.accountId = { $in: arr };
    }

    const params = [
      { $lookup: { from: 'users', localField: 'accountId', foreignField: '_id', as: 'account' } },
      { $unwind: '$account' }
    ];
    this.join(params, q).then((rs: any) => {
      const cbs: any[] = [];
      rs.map((r: any) => {
        delete r.account.password;
        const cb = cbs.find(x => x._id.toString() === r._id.toString());
        if (!cb) {
          cbs.push(r);
        }
      });
      res.setHeader('Content-Type', 'application/json');
      if (cbs) {
        res.send(JSON.stringify(cbs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  // getMyBalanceForAddOrder(balance: number, paymentMethod: string, bPaid: boolean, payable: number, paid: number) {
  //   if (paymentMethod === 'prepaid') {
  //     // return Math.round((balance - payable) * 100) / 100;
  //     return balance;
  //   } else if (paymentMethod === 'cash') {
  //     // if(bPaid){
  //     //   return Math.round((balance + paid - payable) * 100) / 100;
  //     // }else{
  //     //   return Math.round((balance - payable) * 100) / 100;
  //     // }
  //     return balance;
  //   } else if (paymentMethod === 'card' || paymentMethod === 'WECHATPAY') {
  //     if (bPaid) {
  //       return Math.round((balance + paid - payable) * 100) / 100;
  //     } else { // pass
  //       return null; // no need to update balance
  //     }
  //   } else {
  //     return null; // no need to update balance
  //   }
  // }

  // getMyBalanceForRemoveOrder(balance: number, paymentMethod: string, payable: number) {
  //   if (paymentMethod === 'prepaid' || paymentMethod === 'cash') {
  //     return Math.round((balance + payable) * 100) / 100;
  //   } else if (paymentMethod === 'card' || paymentMethod === 'WECHATPAY') {
  //     return Math.round((balance + payable) * 100) / 100;
  //   } else {
  //     return null; // no need to update balance
  //   }
  // }

  // updateMyBalanceForAddOrder(clientId: string, paid: number): Promise<any> {
  //   const self = this;
  //   return new Promise((resolve, reject) => {
  //     this.find({ accountId: clientId }).then((balances: any[]) => {
  //       if (balances && balances.length > 0) {
  //         const balance = balances[0];
  //         const newAmount = Math.round((balance.amount + paid) * 100) / 100;
  //         // const newAmount = this.getMyBalanceForAddOrder(balance.amount, order.paymentMethod, order.status === 'paid', order.total, paid);
  //         if (newAmount === null) {
  //           resolve(null);
  //         } else {
  //           this.updateOne({ accountId: clientId }, { amount: newAmount, ordered: true }).then(x => {
  //             resolve(x);
  //           });
  //         }
  //       } else {
  //         resolve(null);
  //       }
  //     });
  //   });

  // }

  // updateMyBalanceForRemoveOrder(order: any): Promise<any> {
  //   const clientId = order.clientId;
  //   return new Promise((resolve, reject) => {
  //     this.find({ accountId: clientId }).then((balances: any[]) => {
  //       if (balances && balances.length > 0) {
  //         const balance = balances[0];
  //         const newAmount = this.getMyBalanceForRemoveOrder(balance.amount, order.paymentMethod, order.total);
  //         if (newAmount === null) {
  //           resolve(null);
  //         } else {
  //           this.updateOne({ clientId: clientId }, { amount: newAmount }).then(x => {
  //             resolve(x);
  //           });
  //         }
  //       } else {
  //         resolve(null);
  //       }
  //     });
  //   });
  // }

  // //--------------------------------------------------------------------------------
  // // The client can only get one group discount, if he/she has multiple orders.
  // getUpdatesForAddGroupDiscount(orders: IOrder[], balances: IBalance[], groupDiscount: number) {
  //   const groups = this.groupBy(orders, 'clientId');
  //   const a: any[] = [];
  //   const clientIds: string[] = Object.keys(groups);
  //   clientIds.map(clientId => {
  //     const os = groups[clientId];
  //     if (os && os.length > 0) {
  //       const order = os.find((x: any) => x.groupDiscount !== 0);
  //       if (order) { // client already has an order with groupDiscount
  //         // pass
  //       } else { // client has orders but none of them has groupDiscount
  //         if (clientIds.length > 1) {
  //           const b = balances.find(x => x.accountId.toString() === clientId);
  //           if (b) {
  //             const balance = Math.round((b.amount + groupDiscount) * 100) / 100;
  //             a.push({ query: { _id: b._id }, data: { amount: balance } });
  //           } else {
  //             // pass
  //           }
  //         } else {
  //           // pass
  //         }
  //       }
  //     } else {
  //       // pass
  //     }
  //   });
  //   return a;
  // }

  // getUpdatesForRemoveGroupDiscount(orders: any[], balances: any[], groupDiscount: number) {
  //   const groups = this.groupBy(orders, 'clientId');
  //   const clientIds = Object.keys(groups);

  //   if (clientIds && clientIds.length > 1) {
  //     // only need to check update current client's 2nd order, this is by Front end
  //     const a: any[] = [];
  //     Object.keys(groups).map(clientId => {
  //       const group = groups[clientId];
  //       if (group && group.length > 0) {
  //         const order = group.find((x: any) => x.groupDiscount !== 0);
  //         if (order) {
  //           // pass this group
  //         } else {
  //           const b = balances.find(x => x.accountId.toString() === clientId);
  //           const balance = Math.round((b.amount + groupDiscount) * 100) / 100;
  //           a.push({ query: { _id: b._id.toString() }, data: { amount: balance } });
  //         }
  //       }else{
  //         // pass
  //       }
  //     });
  //     return a;
  //   } else { // <= 1
  //     const a: any[] = [];
  //     Object.keys(groups).map(clientId => {
  //       const os = groups[clientId];
  //       if (os && os.length > 0) {
  //         const order = os.find((x: any) => x.groupDiscount !== 0);
  //         if (order) {
  //           const b = balances.find(x => x.accountId.toString() === clientId);
  //           const balance = Math.round((b.amount - groupDiscount) * 100) / 100;
  //           a.push({ query: { _id: b._id.toString() }, data: { amount: balance } });
  //         } else {
  //           // pass
  //         }
  //       }else{
  //         // pass
  //       }
  //     });
  //     return a;
  //   }
  // }

  // addGroupDiscounts(orders: any[]): Promise<any> {
  //   const accountIds: string[] = [];
  //   orders.map(item => { accountIds.push(item.clientId) });

  //   return new Promise((resolve, reject) => {
  //     this.find({ accountId: { $in: accountIds } }).then((balances: IBalance[]) => {
  //       const balanceUpdates = this.getUpdatesForAddGroupDiscount(orders, balances, 2);
  //       if (balanceUpdates && balanceUpdates.length > 0) {
  //         this.bulkUpdate(balanceUpdates, {}).then((r: BulkWriteOpResultObject) => {
  //           resolve(balanceUpdates);
  //         });
  //       } else {
  //         resolve(balanceUpdates);
  //       }
  //     }, (err: any) => {
  //       reject([]);
  //     });
  //   });
  // }

  // // orders = [{data: {clientId: x}}];
  // removeGroupDiscounts(orders: any[]): Promise<any> {
  //   const clientIds: string[] = [];
  //   orders.map(item => { clientIds.push(item.clientId) });

  //   return new Promise((resolve, reject) => {
  //     this.find({ accountId: { $in: clientIds } }).then((balances: any[]) => {
  //       const balanceUpdates = this.getUpdatesForRemoveGroupDiscount(orders, balances, 2);
  //       if (balanceUpdates && balanceUpdates.length > 0) {
  //         this.bulkUpdate(balanceUpdates, {}).then((r: BulkWriteOpResultObject) => {
  //           resolve(balanceUpdates);
  //         });
  //       } else {
  //         resolve(balanceUpdates);
  //       }
  //     });
  //   });
  // }

}
