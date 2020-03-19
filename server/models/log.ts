import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";
import { IOrder } from "../models/order";
import { Account, IAccount } from "./account";
import moment from "moment";
import { resolve } from "url";


export enum Action {
  LOGIN = 1,
  VIEW_ORDER,
  PACK_ORDER,
}

export enum AccountType {
  CLIENT = 1,
  MERCHANT,
  DRIVER,
  ADMIN
}

export interface ILog {
  _id?: string;
  accountId: string;
  merchantId?: string;
  merchantAccountId?: string;

  type: AccountType;
  action: Action;

  account?: IAccount;
  created?: string;
}


export class Log extends Model {
  accountModel : Account;
  constructor(dbo: DB) {
    super(dbo, 'logs');
    this.accountModel = new Account(dbo);
  }

  list(req: Request, res: Response) {
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    
    this.joinFind(query).then((rs: any) => {
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  // reqAllLatest(req: Request, res: Response){
  //   let query = null;
  //   if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
  //     query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
  //   }

  //   this.getLatestByAccount(query.action, query.type, query.delivered).then((rs: any) => {
  //     res.setHeader('Content-Type', 'application/json');
  //     if (rs) {
  //       res.send(JSON.stringify(rs, null, 3));
  //     } else {
  //       res.send(JSON.stringify(null, null, 3))
  //     }
  //   });
  // }

  getLatest(logs: any[]){
    if(logs && logs.length > 0){
      if(logs.length > 1){
        let tmp = logs[0];
        for(let i=1; i<logs.length; i++){
          if(moment(tmp.created).isBefore(moment(logs[i].created))){
            tmp = logs[i];
          }
        }
        return tmp;
      }else{
        return logs[0];
      }
    }else{
      return null;
    }
  }

  groupBy(items: any[], key: string) {
    const groups: any = {};
    items.map(it => {
      const id = it[key].toString();
      const ids = Object.keys(groups);
      const found = ids.length === 0 ? null : ids.find(_id => _id === id);
      if (found) {
        groups[id].push(it);
      } else {
        groups[id] = [it];
      }
    });

    return groups;
  }

  getLatestByAccount(actionId: number, accountType: number, delivered: string): Promise<any[]>{
    const range = { $gte: moment(delivered).startOf('day').toISOString(), $lte: moment(delivered).endOf('day').toISOString() };
    const query = { created: range, action: actionId, type: accountType };

    return new Promise((resolve, reject) => {
      this.joinFind(query).then(logs => {
        let groups: any = {};
        if(accountType === AccountType.MERCHANT){
          groups = this.groupBy(logs, 'merchantAccountId');
        }else{
          groups = this.groupBy(logs, 'accountId');
        }
  
        const rs: any[] = [];
        Object.keys(groups).map(id => {
          const ds = groups[id];
          const latest = this.getLatest(ds);
          if(latest){
            rs.push(latest);
          }
        });
        resolve(rs);
      });
    });
  }

  joinFind(query: any): Promise<IOrder[]> {
    let q = query ? query : {};

    return new Promise((resolve, reject) => {
      this.accountModel.find({}).then(accounts => {
        this.find(q).then((rs: any) => {
          rs.map((r: any) => {
            if(r.accountId){
              const account = accounts.find((a: any) => a._id.toString() === r.accountId.toString());
              if(account){
                if(account.password){
                  delete account.password;
                }
                r.account = account;
              }
            }
          });
          resolve(rs);
        });
      });
    });
  }

  // getMyBalanceForAddOrder(balance: number, paymentMethod: string, bPaid: boolean, payable: number, paid: number) {
  //   if (paymentMethod === PaymentMethod.PREPAY) {
  //     // return Math.round((balance - payable) * 100) / 100;
  //     return balance;
  //   } else if (paymentMethod === PaymentMethod.CASH) {
  //     // if(bPaid){
  //     //   return Math.round((balance + paid - payable) * 100) / 100;
  //     // }else{
  //     //   return Math.round((balance - payable) * 100) / 100;
  //     // }
  //     return balance;
  //   } else if (paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.WECHAT) {
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
  //   if (paymentMethod === PaymentMethod.PREPAY || paymentMethod === PaymentMethod.CASH) {
  //     return Math.round((balance + payable) * 100) / 100;
  //   } else if (paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.WECHAT) {
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
