import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import moment from "moment-timezone";
import { BulkWriteOpResultObject } from "../../node_modules/@types/mongodb";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";

export class ClientBalance extends Model{
  paymentEntity: Entity;
  orderEntity: Entity;
  transactionEntity: Entity;
  
  constructor(dbo: DB) {
    super(dbo, 'client_balances');
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

    if(q && q.accountId && typeof q.accountId === 'string' && q.accountId.length === 24){
      q.accountId = new ObjectID(q.accountId);
    }

    const params = [
      {$lookup: {from: 'users', localField: 'accountId', foreignField: '_id', as: 'account'}},
      {$unwind: '$account'}
    ];
    this.join(params, q).then((rs: any) => {
      rs.map((r: any) => {
        delete r.password;
        delete r.account.password;
      });
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  getMyBalanceForAddOrder(balance: number, paymentMethod: string, bPaid: boolean, payable: number, paid: number) {
    if(paymentMethod === 'prepaid'){
      return Math.round((balance - payable) * 100) / 100;
    }else if(paymentMethod === 'cash'){
      if(bPaid){
        return Math.round((balance + paid - payable) * 100) / 100;
      }else{
        return Math.round((balance - payable) * 100) / 100;
      }
    } else if(paymentMethod === 'card' || paymentMethod === 'WECHATPAY') {
      if(bPaid){
        return Math.round((balance + paid - payable) * 100) / 100;
      }else{ // pass
        return null; // no need to update balance
      }
    } else {
      return null; // no need to update balance
    }
  }

  getMyBalanceForRemoveOrder(balance: number, paymentMethod: string, payable: number) {
    if(paymentMethod === 'prepaid' || paymentMethod === 'cash') {
      return Math.round((balance + payable) * 100) / 100;
    } else if(paymentMethod === 'card' || paymentMethod === 'WECHATPAY') {
      return Math.round((balance + payable) * 100) / 100;
    } else {
      return null; // no need to update balance
    }
  }

  updateMyBalanceForAddOrder(order: any, paid: number) : Promise<any> {
    const clientId = order.clientId;
    const self = this;
    return new Promise( (resolve, reject) => {
      this.find({accountId: clientId}).then((balances: any[]) => {
        if(balances && balances.length>0){
          const balance = balances[0];
          const newAmount = this.getMyBalanceForAddOrder(balance.amount, order.paymentMethod, order.status === 'paid', order.total, paid);
          if(newAmount === null){
            resolve(null);
          }else{
            this.updateOne({'accountId': clientId}, {amount: newAmount, ordered: true}).then(x => {
              resolve(x);
            });
          }
        }else{
          resolve(null);
        }      
      });
    });
    
  }

  updateMyBalanceForRemoveOrder(order: any): Promise<any> {
    const clientId = order.clientId;
    return new Promise( (resolve, reject) => {
      this.find({accountId: clientId}).then((balances: any[]) => {
        if(balances && balances.length>0){
          const balance = balances[0];
          const newAmount = this.getMyBalanceForRemoveOrder(balance.amount, order.paymentMethod, order.total);
          if(newAmount === null){
            resolve(null);
          }else{
            this.updateOne({clientId: clientId}, {amount: newAmount}).then(x => {
              resolve(x);
            });
          }
        }else{
          resolve(null);
        }
      });
    });
  }

  //--------------------------------------------------------------------------------
  // The client can only get one group discount, if he/she has multiple orders.
  getBalancesToAddGroupDiscount(orders: any[], balances: any[], groupDiscount: number) {
    const groups = this.groupBy(orders, 'clientId');
    const a: any[] = [];
    const clientIds: string[] = Object.keys(groups);
    clientIds.map(clientId => {
      const os = groups[clientId];
      if ( os && os.length > 0) {
        const order = os.find((x: any) => x.groupDiscount !== 0 );
        if(order){
          // pass
        }else{
          if(clientIds.length > 1){
            const b = balances.find(x => x.accountId.toString() === clientId);
            if(b){
              const balance = Math.round((b.amount + groupDiscount) * 100) / 100;
              a.push({ query: { id: b.id.toString() }, data: { amount: balance } });
            }
          }else{
            // pass
          }
        }
      }
    });
    return a;
  }

  groupBy(items: any[], key: string) {
    let groups = items.reduce((result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }), {});

    Object.keys(groups).map(key => {
      key === 'undefined' ? delete groups[key] : '';
    });

    return groups;
  }
  
  getBalancesToRemoveGroupDiscount(orders: any[], balances: any[], groupDiscount: number) {
    const groups = this.groupBy(orders, 'clientId');
    const clientIds = Object.keys(groups);
    
    if(clientIds && clientIds.length > 1){
      // only need to check update current client's 2nd order, this is by Front end
      const a: any[] = [];
      Object.keys(groups).map(clientId => {
        const group = groups[clientId];
        if ( group && group.length > 0) {
          const order = group.find((x: any) => x.groupDiscount !== 0 );
          if(order){
            // pass this group
          }else{
            const b = balances.find(x => x.accountId.toString() === clientId);
            const balance = Math.round((b.amount + groupDiscount) * 100) / 100;
            a.push({ query: { id: b.id.toString() }, data: { amount: balance }});  
          }
        }
      });
      return a;
    }else{ // <= 1
      const a: any[] = [];
      Object.keys(groups).map(clientId => {
        const os = groups[clientId];
        if ( os && os.length > 0) {
          const order = os.find((x: any) => x.groupDiscount !== 0 );
          if(order){
            const b = balances.find(x => x.accountId.toString() === clientId);
            const balance = Math.round((b.amount - groupDiscount) * 100) / 100;
            a.push({ query: { id: b.id.toString() }, data: { amount: balance } });
          }else{
            // pass
          }
        }
      });
      return a;
    }
  }

  addGroupDiscountForBalances(orders: any[]): Promise<any> {
    const clientIds: string[] = [];
    orders.map(item => { clientIds.push(item.clientId) });

    return new Promise((resolve, reject) => {
      this.find({ accountId: { $in: clientIds } }).then((balances: any[]) => {
        const balanceUpdates = this.getBalancesToAddGroupDiscount(orders, balances, 2);
        if (balanceUpdates && balanceUpdates.length > 0) {
          this.bulkUpdate(balanceUpdates, {}).then((r: BulkWriteOpResultObject) => {
            resolve(balanceUpdates);
          });
        } else {
          resolve(null);
        }
      }, (err: any) => {
        reject(null);
      });
    });

  }

  // orders = [{data: {clientId: x}}];
  removeGroupDiscountForBalances(orders: any[]): Promise<any> {
    const clientIds: string[] = [];
    orders.map(item => { clientIds.push(item.clientId) });

    return new Promise((resolve, reject) => {
      this.find({ accountId: { $in: clientIds } }).then((balances: any[]) => {
        const balanceUpdates = this.getBalancesToRemoveGroupDiscount(orders, balances, 2);
        if (balanceUpdates && balanceUpdates.length > 0) {
          this.bulkUpdate(balanceUpdates, {}).then((r: BulkWriteOpResultObject) => {
            resolve(balanceUpdates);
          });
        } else {
          resolve(balanceUpdates);
        }
      });
    });
  }

  updateAll(){
    const dt = moment().tz("America/Toronto").endOf('day').toDate().toISOString();
    const orderQuery = {delivered: { $lt: dt }, status: {$nin: ['bad', 'del', 'tmp']}}; // , delivered: { $lt: moment().endOf('day').toDate() }};
    this.orderEntity.find(orderQuery).then(os => {
      this.transactionEntity.find({type: 'credit'}).then(ts => {
        this.find({}).then(cbs => {
          // 1. get all the clients
          const clients: any[] = [];
          ts.map((t:any) => {
            const client = clients.find(c => c.id === t.fromId);
            if (!client) {
              clients.push({ id: t.fromId, name: t.fromName });
            }
          });

          clients.map(c => {
            // 2. get debit and credit
            const orders = os.filter((order:any) => order.clientId === c.id);
            const transactions = ts.filter((t:any) => t.fromId === c.id);
            let list:any[] = [];
            let balance = 0;
            transactions.map((t:any) => {
              list.push({ date: t.created, type: 'credit', paid: t.amount, consumed: 0 });
            });

            orders.map((order:any) => {
              list.push({ date: order.delivered, type: 'debit', paid: 0, consumed: order.total });
            });

            list = list.sort((a: any, b: any) => {
              const aMoment = moment(a.date);
              const bMoment = moment(b.date);
              if (aMoment.isAfter(bMoment)) {
                return 1; // b at top
              } else if (bMoment.isAfter(aMoment)) {
                return -1;
              } else {
                if (a.type === 'debit' && b.type === 'credit') {
                  return -1;
                } else {
                  return 1;
                }
              }
            });

            // 3. get balance
            list.map(item => {
              if (item.type === 'debit') {
                balance -= item.consumed;
              } else if (item.type === 'credit') {
                balance += item.paid;
              }
            });

            // 4. update db if exist other wise create a new one
            const clientBalance = cbs.find((cb:any) => cb.clientId === c.id);
            if (clientBalance) {
              this.updateOne({ clientId: c.id }, { amount: balance, modified: new Date() }).then(()=>{});
            } else {
              const data: any = {
                clientId: c.id,
                clientName: c.name,
                amount: balance,
                created: new Date(),
                modified: new Date()
              };
              this.insertOne(data).then(() => {});
            }
          });
        });
      });
    });
  }
}
