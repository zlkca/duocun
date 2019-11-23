import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import { ILocation } from "./location";
import { BulkWriteOpResultObject, ObjectID } from "mongodb";
import { OrderSequence } from "./order-sequence";
import { ClientBalance, IClientBalance } from "./client-balance";
import moment from 'moment';
import { Restaurant } from "./restaurant";
import { resolve } from "path";
import { Account, IAccount } from "./account";
import { Transaction, ITransaction } from "./transaction";
import { Product } from "./product";
import { Contact } from "./contact";
import { Assignment } from "./assignment";

const CASH_ID = '5c9511bb0851a5096e044d10';
const CASH_NAME = 'Cash';
const BANK_ID = '5c95019e0851a5096e044d0c';
const BANK_NAME = 'TD Bank';

export interface IPayment{
  orderId: string,
  clientId: string,
  clientName: string,
  merchantId: string,
  merchantName: string,
  action: string,
  cost: number,
  total: number,
  paid: number,
  chargeId: string
}

export interface IOrderItem {
  id?: number;
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  price: number;
  cost?: number;
  quantity: number;
}

export interface IOrder {
  _id: string;
  code?: string;
  clientId: string;
  clientName: string;
  clientPhoneNumber?: string;
  // prepaidClient?: boolean;
  merchantId: string;
  merchantName: string;
  driverId?: string;
  driverName?: string;
  status?: string;
  note?: string;
  address?: string;
  location: ILocation; // delivery address
  delivered?: string;
  created: string;
  modified?: string;
  items?: IOrderItem[];
  tax?: number;
  tips?: number;
  // deliveryAddress?: Address; // duplicated should remove
  deliveryCost?: number;
  deliveryDiscount?: number;
  overRangeCharge?: number;
  groupDiscount?: number;
  productTotal?: number;

  cost: number;
  price: number;
  total: number;
  paymentMethod: string;
  chargeId?: string; // stripe chargeId
  transactionId?: string;

  mode?: string; // for unit test
  dateType: string; // 'today', 'tomorrow'
}

export class Order extends Model {
  private productModel: Product;
  private sequenceModel: OrderSequence;
  private merchantModel: Restaurant;
  private accountModel: Account;
  private transactionModel: Transaction;
  private contactModel: Contact;
  private assignmentModel: Assignment;

  constructor(dbo: DB) {
    super(dbo, 'orders');

    this.productModel = new Product(dbo);
    this.sequenceModel = new OrderSequence(dbo);
    this.merchantModel = new Restaurant(dbo);
    this.accountModel = new Account(dbo);
    this.transactionModel = new Transaction(dbo);
    this.contactModel = new Contact(dbo);
    this.assignmentModel = new Assignment(dbo);
  }

  list(req: Request, res: Response) {
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    if (query.hasOwnProperty('pickup')) {
      query.delivered = this.getPickupDateTime(query['pickup']);
      delete query.pickup;
    }
    let q = query? query: {};

    this.contactModel.find({}).then(contacts => {
      this.merchantModel.find({}).then(ms => {
        this.productModel.find({}).then(ps => {
          this.find(q).then((rs: any) => {
            rs.map((order: any) => {
              const items: any[] = [];
              order.client = contacts.find((c: any) => c.accountId.toString() === order.clientId.toString());
              order.merchant = ms.find((m: any) => m._id.toString() === order.merchantId.toString());
              order.items.map((it: any) => {
                const product = ps.find((p: any) => p._id.toString() === it.productId.toString());
                if (product) {
                  items.push({ product: product, quantity: it.quantity, price: it.price, cost: it.cost });
                }
              });
              order.items = items;
            });
      
            res.setHeader('Content-Type', 'application/json');
            if (rs) {
              res.send(JSON.stringify(rs, null, 3));
            } else {
              res.send(JSON.stringify(null, null, 3));
            }
          });
        });
      });
    });
  }

  // pickup --- string '11:20'
  getPickupDateTime(pickup: string){
    const h = +(pickup.split(':')[0]);
    const m = +(pickup.split(':')[1]);
    return moment().set({ hour: h, minute: m, second: 0, millisecond: 0 }).toISOString();
  }

  quickFind(req: Request, res: Response) {
    let query: any = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    if (query.hasOwnProperty('pickup')) {
      query.delivered = this.getPickupDateTime(query['pickup']);
      delete query.pickup;
    }

    this.find(query).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(x, null, 3));
    });
  }

  getDeliverDateTime(createdDateTime: string, phases: any[], dateType: string) {
    if (dateType === 'today') {
      const created = moment(createdDateTime);

      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const orderEndTime = this.getTime(moment(), phase.orderEnd);

        if (i === 0) {
          if (created.isSameOrBefore(orderEndTime)) {
            return this.getTime(moment(), phase.pickup).toISOString();
          }
        } else {
          const prePhase = phases[i - 1];
          const preEndTime = this.getTime(moment(), prePhase.orderEnd);

          if (created.isAfter(preEndTime) && created.isSameOrBefore(orderEndTime)) {
            return this.getTime(moment(), phase.pickup).toISOString();
          }
        }
      }
    } else {
      const phase = phases[0];
      return this.getTime(moment().add(1, 'day'), phase.pickup).toISOString();
    }
  }

  create(req: Request, res: Response) {
    const order = req.body;
    this.doInsertOne(order).then(savedOrder => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(savedOrder, null, 3));
    });
  }

  doInsertOne(order: IOrder) {
    const location: ILocation = order.location;
    const clientId: string = order.clientId;
    const merchantId: string = order.merchantId;

    return new Promise((resolve, reject) => {
      this.sequenceModel.reqSequence().then((sequence: number) => {

        order.code = this.sequenceModel.getCode(location, sequence);
        order.created = moment().toISOString();

        this.accountModel.findOne({ _id: clientId }).then((account: IAccount) => {
          this.merchantModel.findOne({ _id: merchantId }).then((merchant: any) => {
            if (account.pickup) {
              const date = (order.dateType === 'today') ? moment() : moment().add(1, 'day');
              order.delivered = this.getTime(date, account.pickup).toISOString();
            } else {
              order.delivered = this.getDeliverDateTime(order.created, merchant.phases, order.dateType);
            }

            delete order.dateType;

            this.insertOne(order).then((savedOrder: IOrder) => {
              const merchantId: string = order.merchantId.toString();
              const merchantName = order.merchantName;
              const clientId: string = order.clientId.toString();
              const clientName = order.clientName;
              const cost = order.cost;
              const total = order.total;
              const deliverd = order.delivered;

              // temporary order didn't update transaction until paid
              if (order.status === 'tmp') {
                resolve(savedOrder);
              } else {
                this.transactionModel.saveTransactionsForPlaceOrder(
                  savedOrder._id.toString(), 
                  merchantId, merchantName, clientId, clientName, cost, total, deliverd).then(() => {
                  resolve(savedOrder);
                });
              }
            });
          });
        });
      });
    });
  }

  doRemoveOne(orderId: string) {
    return new Promise((resolve, reject) => {
      this.find({ _id: orderId }).then(docs => {
        if (docs && docs.length > 0) {
          const order = docs[0];
          this.updateOne({ _id: orderId }, { status: 'del' }).then(x => {
            // temporary order didn't update transaction until paid
            if (order.status === 'tmp') {
              resolve(order);
            } else {
              const merchantId: string = order.merchantId.toString();
              const merchantName = order.merchantName;
              const clientId: string = order.clientId.toString();
              const clientName = order.clientName;
              const cost = order.cost;
              const total = order.total;
              const delivered = order.deliverd;

              this.transactionModel.updateMany({orderId: orderId}, {status: 'del'}).then( () => {
                this.transactionModel.saveTransactionsForRemoveOrder(merchantId, merchantName, clientId, clientName, cost, total, delivered).then(() => {
                  resolve(order);
                });
              });
            }
          });
        } else { // should never be here
          resolve();
        }
      });
    });
  }

  removeOrder(req: Request, res: Response) {
    const orderId = req.params.id;
    this.doRemoveOne(orderId).then(x => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(x, null, 3));
    });
  }

  // obsoleted
  createV1(req: Request, res: Response) {
    if (req.body instanceof Array) {
      this.insertMany(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    } else {
      this.insertOne(req.body).then((ret: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(ret, null, 3));
      });
    }
  }

  // deprecated !!!
  //---------------------------------------------------------------------
  // The client has to have the balance entry {accountId: x, amount: y}
  // body --- {clientId:c, delivered:x, address:y, groupDiscount: z}
  // createOne(body: any, cb: any) {
  //   const date = body.delivered;
  //   const address = body.address;
  //   this.find({ delivered: date, address: address, status: { $nin: ['bad', 'del', 'tmp'] } }).then(orders => {
  //     let newGroupDiscount = body.groupDiscount;
  //     const others = orders.filter((x: any) => x.clientId && x.clientId !== body.clientId);
  //     const orderUpdates = this.getUpdatesForAddGroupDiscount(others, newGroupDiscount);

  //     if (orderUpdates && orderUpdates.length > 0) {
  //       this.bulkUpdate(orderUpdates, {}).then((r: BulkWriteOpResultObject) => {
  //         const clientIds: string[] = [];
  //         orderUpdates.map(item => { clientIds.push(item.data.clientId) });
  //         this.clientBalanceModel.find({ accountId: { $in: clientIds } }).then((bs: any[]) => {
  //           if (bs && bs.length > 0) {
  //             // const balanceUpdates = this.getUpdatesForAddGroupDiscount(others, bs, newGroupDiscount);
  //             // this.clientBalanceEntity.bulkUpdate(balanceUpdates, {}).then((r1: BulkWriteOpResultObject) => {
  //             //   this.insertOne(body).then((x: any) => {
  //             //     cb(x);
  //             //   });
  //             // });
  //           } else {
  //             this.insertOne(body).then((x: any) => {
  //               cb(x);
  //             });
  //           }
  //         });
  //       });
  //     } else {
  //       this.insertOne(body).then((x: any) => {
  //         cb(x);
  //       });
  //     }
  //   });
  // }

  // date: string, address: string
  addGroupDiscounts(clientId: string, orders: any[]): Promise<any> {
    // this.find({ delivered: date, address: address, status: { $nin: ['bad', 'del', 'tmp'] } }).then(orders => {
    const others = orders.filter((x: any) => x.clientId && x.clientId.toString() !== clientId.toString()); // fix me!!!
    // others > 0 then affect other orders and balances
    const orderUpdates = this.getUpdatesForAddGroupDiscount(others, 2);

    return new Promise((resolve, reject) => {
      if (orderUpdates && orderUpdates.length > 0) {
        this.bulkUpdate(orderUpdates, {}).then((r: BulkWriteOpResultObject) => {
          resolve(orderUpdates);
        });
      } else {
        resolve(orderUpdates);
      }
    });
  }

  // date: string, address: string
  removeGroupDiscounts(orders: any[]): Promise<any> {
    const orderUpdates = this.getUpdatesForRemoveGroupDiscount(orders, 2);
    return new Promise((resolve, reject) => {
      if (orderUpdates && orderUpdates.length > 0) {
        this.bulkUpdate(orderUpdates, {}).then((r: BulkWriteOpResultObject) => {
          resolve(orderUpdates);
        });
      } else {
        resolve(orderUpdates);
      }
    });
  }

  replace(req: Request, res: Response) {
    this.replaceById(req.body.id, req.body).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      // io.emit('updateOrders', x);
      res.end(JSON.stringify(x, null, 3));
    });
  }

  //--------------------------------------------------------------------------------
  // The client can only get one group discount, if he/she has multiple orders.
  getUpdatesForAddGroupDiscount(orders: IOrder[], groupDiscount: number) {
    const groups = this.groupBy(orders, 'clientId');
    const a: any[] = [];
    Object.keys(groups).map(key => {
      const os = groups[key];
      if (os && os.length > 0) {
        const hasGroupDiscount = os.find((x: IOrder) => x.groupDiscount !== 0);
        if (hasGroupDiscount) {
          // pass
        } else {
          const order = os[0];
          const amount = Math.round(((order.total ? order.total : 0) - groupDiscount) * 100) / 100;
          a.push({
            query: { _id: order._id.toString() },
            data: { total: amount, groupDiscount: groupDiscount }
          });
        }
      }
    });
    return a;
  }

  checkGroupDiscount(req: Request, res: Response) {
    const clientId: string = req.body.clientId;
    const merchantId: string = req.body.merchantId;
    const dateType: string = req.body.dateType;
    const address: string = req.body.address;

    this.eligibleForGroupDiscount(clientId, merchantId, dateType, address).then((bEligible: boolean) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(bEligible, null, 3));
    });
  }

  eligibleForGroupDiscount(clientId: string, merchantId: string, dateType: string, address: string): Promise<boolean> {
    const date = dateType === 'today' ? moment() : moment().add(1, 'day');
    const range = { $gte: date.startOf('day').toISOString(), $lte: date.endOf('day').toISOString() };
    const query = { delivered: range, address: address, status: { $nin: ['bad', 'del', 'tmp'] } };

    return new Promise((resolve, reject) => {
      this.find(query).then(orders => {
        const groups = this.groupBy(orders, 'clientId');
        const clientIds = Object.keys(groups);

        if (clientIds && clientIds.length > 0) {
          const found = clientIds.find(x => x === clientId);
          if (found) {
            if (clientIds.length === 1) { // only me
              resolve(false);
            } else { // > 1, has other clients
              const os = groups[clientId];
              if (os && os.length > 0) {
                const hasGroupDiscount = os.find((x: any) => x.groupDiscount !== 0);
                if (hasGroupDiscount) {
                  resolve(false);
                } else {
                  resolve(true);
                }
              } else {
                resolve(true); // [] should not happen
              }
            }
          } else {
            resolve(true);
          }
        } else {
          resolve(false);
        }
      });
    });
  }

  //--------------------------------------------------------------------------------
  // call after remove order
  // The client can only get one group discount, if he/she has multiple orders.
  getUpdatesForRemoveGroupDiscount(orders: any[], groupDiscount: number) {
    const groups = this.groupBy(orders, 'clientId');
    const clientIds = Object.keys(groups);

    if (clientIds && clientIds.length > 1) { // only need to check update current client's 2nd order
      const a: any[] = [];
      Object.keys(groups).map(key => {
        const group = groups[key];
        if (group && group.length > 0) {
          const order = group.find((x: any) => x.groupDiscount !== 0);
          if (order) {
            // pass this group
          } else {
            const newOrderWithGroupDiscount = group[0];
            const amount = Math.round((newOrderWithGroupDiscount.total - groupDiscount) * 100) / 100;
            a.push({
              query: { _id: newOrderWithGroupDiscount._id.toString() },
              data: { total: amount, groupDiscount: groupDiscount, clientId: newOrderWithGroupDiscount.clientId }
            });
          }
        }
      });
      return a;
    } else { // <= 1
      const a: any[] = [];
      Object.keys(groups).map(key => {
        const os = groups[key];
        if (os && os.length > 0) {
          const order = os.find((x: any) => x.groupDiscount !== 0);
          if (order) {
            const amount = Math.round(((order.total ? order.total : 0) + groupDiscount) * 100) / 100;
            a.push({ query: { _id: order._id.toString() }, data: { total: amount, groupDiscount: 0, clientId: order.clientId } });
          } else {
            // pass this group
          }
        }
      });
      return a;
    }
  }

  getDistinctArray(items: any, field: string) {
    const a: any[] = [];
    items.map((item: any) => {
      if (item.hasOwnProperty(field)) {
        const b = a.find(x => x[field] === item[field]);
        if (!b) {
          a.push(item);
        }
      }
    });
    return a;
  }

  // doRemoveOne(orderId: string,  cb?: any){
  //   this.find({ id: orderId }).then(docs => {
  //     if (docs && docs.length > 0) {
  //       const date = docs[0].delivered;
  //       const address = docs[0].address;

  //       this.updateOne({ id: orderId }, { status: 'del' }).then(x => { // set order status to del

  //         this.find({ delivered: date, address: address, status: { $nin: ['del', 'bad', 'tmp'] } }).then(orders => {

  //           const orderUpdates = this.getUpdatesForRemoveGroupDiscount(orders,  2);
  //           // const balanceUpdates = this.getUpdatesForRemoveGroupDiscount(orders, balances, 2);

  //           this.bulkUpdate(orderUpdates, {}).then((r) => {
  //             cb();
  //           //       this.clientBalanceEntity.find({ accountId: order.clientId }).then((bs: any[]) => {
  //           //         if (bs && bs.length > 0) {
  //           //           const b = bs[0];
  //           //           this.clientBalanceEntity.updateOne({ accountId: order.clientId }, { amount: b.amount - 2 }).then(() => {
  //           //             res.setHeader('Content-Type', 'application/json');
  //           //             res.end(JSON.stringify(x, null, 3));
  //           //           });
  //           //         } else {
  //           //           res.setHeader('Content-Type', 'application/json');
  //           //           res.end(JSON.stringify(x, null, 3));
  //           //         }
  //           //       });
  //           //     });
  //           //   } else {
  //           //     res.setHeader('Content-Type', 'application/json');
  //           //     res.end(JSON.stringify(x, null, 3));
  //           //   }
  //           // } else {
  //           //   res.setHeader('Content-Type', 'application/json');
  //           //   res.end(JSON.stringify(x, null, 3));
  //           // }
  //           });
  //         });
  //       });
  //     } else {
  //       cb();
  //       // res.setHeader('Content-Type', 'application/json');
  //       // res.end(JSON.stringify(null, null, 3));
  //     }
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

  //-------------------------------------------------------
  // pickupTime (string) --- eg. '11:20', '12:00'
  updateDeliveryTime(req: Request, res: Response) {
    const pickupTime: string = req.body.pickup;
    const orderId: string = req.body.orderId;
    const delivered: string = this.getTime(moment(), pickupTime).toISOString();

    this.updateOne({ _id: orderId }, { delivered: delivered }).then((result) => {
      this.find({ _id: orderId }).then((orders: IOrder[]) => {
        const order = orders[0];
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(order, null, 3));
      });
    });
  }


  // --------------------------------------------------------------------------------------
  // 1.update order status to 'paid'
  // 2.add two transactions for place order and add another transaction for deposit to bank
  // 3.update account balance
  doProcessPayment(order: IOrder, action: string, paid: number, chargeId: string){
    const orderId = order._id;
    const merchantId: string = order.merchantId.toString();
    const merchantName = order.merchantName;
    const clientId: string = order.clientId.toString();
    const clientName = order.clientName;
    const cost = order.cost;
    const total = order.total;
    const deliverd = order.delivered;

    const tr: ITransaction = {
      fromId: clientId,
      fromName: clientName,
      toId: BANK_ID,
      toName: BANK_NAME,
      action: action,
      amount: Math.round(paid * 100) / 100,
      delivered: deliverd
    };

    return new Promise((resolve, reject) => {
      this.transactionModel.saveTransactionsForPlaceOrder(
        order._id.toString(), 
        merchantId, merchantName, clientId, clientName, cost, total, deliverd).then(()  => {
        this.transactionModel.doInsertOne(tr).then(t => {
          const data = { status: 'paid', chargeId: chargeId, transactionId: t._id };
          this.updateOne({ _id: orderId }, data).then((r: any) => { // result
            // res.setHeader('Content-Type', 'application/json');
            // res.end(JSON.stringify(r, null, 3));
            resolve(r);
          });
        });
      });
    });
  }


  // tools
  updatePurchaseTag(req: Request, res: Response) {
    this.accountModel.find({type: {$nin:['system', 'merchant', 'driver']}}).then(accounts => {
      this.distinct('clientId', { status: { $nin: ['del', 'tmp'] } }).then((clientIds: any[]) => {
        const datas: any[] = [];
        clientIds.map(clientId => {
          const account = accounts.find((a: any) => a._id.toString() === clientId.toString());
          if(account){
            datas.push({
              query: { _id: clientId },
              data: { type: 'client' }
            });
          }
        });
  
        this.accountModel.bulkUpdate(datas).then(() => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify('success', null, 3));
        });
      });
    });
    // this.accountModel.find({roles: 5}).then(accounts => {
    //   const datas: any[] = [];
    //   accounts.map((account: any) => {
    //     datas.push({
    //       query: { _id: account._id },
    //       data: { type: 'driver' }
    //     });
    //   });
  
    //   this.accountModel.bulkUpdate(datas).then(() => {
    //     res.setHeader('Content-Type', 'application/json');
    //     res.end(JSON.stringify('success', null, 3));
    //   });
    // });
  }

  //---------------------------------------------------------------
  // change order status to 'paid' and insert a new transaction
  pay(toId: string, toName: string, received: number, orderId: string, note?: string) {
    const data = {
      status: 'paid',
      driverId: toId,
      driverName: toName
    };

    return new Promise((resolve, reject) => {
      this.updateOne({_id: orderId}, data).then(rt => {
        this.findOne({_id: orderId}).then(order => {
          const tr = {
            orderId: order._id.toString(),
            fromId: order.clientId.toString(),
            fromName: order.clientName,
            toId: toId,
            toName: toName,
            type: 'credit',
            action: 'client pay cash',
            amount: received,
            note: note
          };
          this.transactionModel.doInsertOne(tr).then(t => {
            resolve(order);
          });
        });
      });
    });
  }


  // pay order and update assignment to status 'done'
  payOrder(req: Request, res: Response) {
    const toId = req.body.toId;
    const toName = req.body.toName;
    const received = +req.body.received;
    const orderId = req.body.orderId;
    const note = req.body.note;

    this.pay(toId, toName, received, orderId, note).then((order: any) => {
      this.assignmentModel.updateOne({orderId: orderId}, {status: 'done'}).then( () => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'success' }, null, 3));
      });
    });
  }

  groupBySameDay(items: any[], key: string) {
    const groups: any = {};
    items.map(it => {
      const date = moment(it[key]).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      const dt = Object.keys(groups).find(x => moment(x).isSame(date, 'day'));

      if (dt) {
        groups[dt].push(it);
      } else {
        groups[date.toISOString()] = [it];
      }
    });

    return groups;
  }

  getOrderTrends(req: Request, res: Response){
    const query = {
      // delivered: { $gt: moment('2019-06-01').toDate() },
      status: { $nin: ['bad', 'del', 'tmp'] }
    };

    this.find(query).then(orders => {
      const group = this.groupBySameDay(orders, 'delivered');
      const keys = Object.keys(group);
      const vals: any[] = [];
      keys.map(key => {
        vals.push(group[key] ? group[key].length : 0);
      });

      // this.barChartLabels = keys;
      // this.barChartData = [{ data: vals, label: '订单数' }];

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ keys: keys, vals: vals }, null, 3));
    });
  }


}