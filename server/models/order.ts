import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import { ILocation } from "./location";
import { BulkWriteOpResultObject } from "mongodb";
import { OrderSequence } from "./order-sequence";
import moment from 'moment';
import { Merchant, IPhase, IMerchant, IDbMerchant } from "./merchant";
import { Account, IAccount } from "./account";
import { Transaction, ITransaction } from "./transaction";
import { Product, IProduct } from "./product";
import { CellApplication, CellApplicationStatus, ICellApplication } from "./cell-application";
import { Log, Action, AccountType } from "./log";
import { resolve } from "url";

const CASH_ID = '5c9511bb0851a5096e044d10';
const CASH_NAME = 'Cash';
const BANK_ID = '5c95019e0851a5096e044d0c';
const BANK_NAME = 'TD Bank';

export enum OrderType {
  FOOD_DELIVERY = 1,
  MOBILE_PLAN_SETUP,
  MOBILE_PLAN_MONTHLY
}

export enum OrderStatus {
  BAD = 1,
  DELETED,
  TEMP,         // generate a temp order for electronic order
  NEW,
  LOADED,               // The driver took the food from Merchant
  DONE,                 // Finish delivery
  MERCHANT_CHECKED      // VIEWED BY MERCHANT
}

export enum PaymentStatus {
  UNPAID = 1,
  PAID
}

export interface IOrderItem {
  productId: string;
  productName: string;
  // merchantId: string;
  // merchantName?: string;
  price: number;
  cost: number;
  quantity: number;

  product?: IProduct;
}

export interface IOrder {
  _id?: string;
  code?: string;
  clientId: string;
  clientName: string;
  clientPhoneNumber?: string;
  // prepaidClient?: boolean;
  merchantId: string;
  merchantName: string;
  driverId?: string;
  driverName?: string;
  type?: OrderType;        // OrderType

  paymentStatus?: PaymentStatus;
  status?: OrderStatus;

  note?: string;
  address?: string;
  location: ILocation; // delivery address
  delivered?: string;
  created?: string;
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
  dateType?: string; // 'today', 'tomorrow'

  client?: IAccount;
  driver?: IAccount;
  merchantAccount?: IAccount;
  merchant?: IMerchant;
}

export class Order extends Model {
  private productModel: Product;
  private sequenceModel: OrderSequence;
  private merchantModel: Merchant;
  private accountModel: Account;
  private transactionModel: Transaction;
  private cellApplicationModel: CellApplication;
  private logModel: Log;
  constructor(dbo: DB) {
    super(dbo, 'orders');

    this.productModel = new Product(dbo);
    this.sequenceModel = new OrderSequence(dbo);
    this.merchantModel = new Merchant(dbo);
    this.accountModel = new Account(dbo);
    this.transactionModel = new Transaction(dbo);
    this.cellApplicationModel = new CellApplication(dbo);
    this.logModel = new Log(dbo);
  }

  list(req: Request, res: Response) {
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    this.joinFind(query).then(rs => {
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3));
      }
    });
  }

  joinFind(query: any): Promise<IOrder[]> {
    if (query.hasOwnProperty('pickup')) {
      query.delivered = this.getPickupDateTime(query['pickup']);
      delete query.pickup;
    }
    let q = query ? query : {};

    return new Promise((resolve, reject) => {
      this.accountModel.find({}).then(accounts => {
        this.merchantModel.find({}).then(merchants => {
          this.productModel.find({}).then(ps => {
            this.find(q).then((rs: any) => {
              rs.map((order: any) => {
                const items: any[] = [];
                accounts.map((a: IAccount) => {
                  if (a && a.password) {
                    delete a.password;
                  }
                });

                if (order.clientId) {
                  const client = accounts.find((a: any) => a._id.toString() === order.clientId.toString());
                  if (client) {
                    if (client.password) {
                      delete client.password;
                    }
                    order.client = client;
                  }
                } else {
                  console.log(order._id);
                }

                if (order.merchantId) {
                  order.merchant = merchants.find((m: any) => m._id.toString() === order.merchantId.toString());
                } else {
                  console.log(order._id);
                }

                if (order.merchant && order.merchant.accountId) {
                  const merchantAccount = accounts.find((a: any) => a && order.merchant && a._id.toString() === order.merchant.accountId.toString());
                  if (merchantAccount) {
                    if (merchantAccount.password) {
                      delete merchantAccount.password;
                    }
                    order.merchantAccount = merchantAccount;
                  }
                } else {
                  console.log(order._id);
                }

                if (order.driverId) {
                  const driver = accounts.find((a: IAccount) => a._id.toString() === order.driverId.toString());
                  if (driver) {
                    if (driver.password) {
                      delete driver.password;
                    }
                    order.driver = driver;
                  }
                } else {
                  console.log(order._id);
                }

                if (order.items) {
                  order.items.map((it: IOrderItem) => {
                    const product = ps.find((p: any) => p && p._id.toString() === it.productId.toString());
                    if (product) {
                      items.push({ productId: it.productId, quantity: it.quantity, price: it.price, cost: it.cost, product: product });
                    }
                  });
                  order.items = items;
                }
              });

              resolve(rs);
            });
          });
        });
      });
    });
  }



  // pickup --- string '11:20'
  getPickupDateTime(pickup: string) {
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

  create(req: Request, res: Response) {
    const order = req.body;
    this.doInsertOne(order).then(savedOrder => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(savedOrder, null, 3));
    });
  }

  // local --- local date time string '2019-11-03T11:20:00.000Z', local.isUTC() must be false.
  // sLocalTime     --- local hour and minute eg. '11:20'
  // return --- utc date time
  setLocalTime(localDateTime: moment.Moment, sLocalTime: string): moment.Moment {
    const hour = +(sLocalTime.split(':')[0]);   // local hour
    const minute = +(sLocalTime.split(':')[1]); // local minute
    return localDateTime.set({ hour: hour, minute: minute, second: 0, millisecond: 0 });
  }

  // sUTC --- utc date time string
  toLocalDateTimeString(sUTC: string) {
    return moment(sUTC).local().format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  // if over 11:30, the return dt is 11:20, this shouldn't happen
  // return --- local date time string
  // created --- must be local date time string!!! '2019-11-03T11:20:00.000Z'
  getDeliveryDateTimeByPhase(sCreated: string, phases: IPhase[], dateType: string): string {
    const created = moment(sCreated);

    if (dateType === 'today') {
      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const orderEndTime = this.setLocalTime(moment(sCreated), phase.orderEnd);

        if (i === 0) {
          if (created.isSameOrBefore(orderEndTime)) {
            return this.setLocalTime(moment(sCreated), phase.pickup).toISOString();
          } else {
            // pass
          }
        } else {
          const prePhase = phases[i - 1];
          const preEndTime = this.setLocalTime(moment(sCreated), prePhase.orderEnd);

          if (created.isAfter(preEndTime) && created.isSameOrBefore(orderEndTime)) {
            return this.setLocalTime(moment(sCreated), phase.pickup).toISOString();
          } else {
            // pass
          }
        }
      }
      // if none of the phase hit, use the first
      const first = phases[0];
      return this.setLocalTime(moment(sCreated), first.pickup).toISOString();
    } else {
      const phase = phases[0];
      return this.setLocalTime(moment(sCreated), phase.pickup).add(1, 'day').toISOString();
    }
  }

  // dateType --- 'today' or 'tomorrow'
  getDeliveryDateTime(orderType: OrderType, dateType: string, clientId: string, phases: IPhase[], created: string): Promise<string> {
    // const orderType = order.type;
    // const dateType: any = order.dateType;
    // const clientId = order.clientId;
    // const merchantId = order.merchantId;

    return new Promise((resolve, reject) => {
      const local = moment();
      if (orderType === OrderType.MOBILE_PLAN_MONTHLY || orderType === OrderType.MOBILE_PLAN_SETUP) {
        const delivered = this.setLocalTime(local, '23:30').toISOString();
        resolve(delivered);
      } else {
        let delivered = '';
        this.accountModel.findOne({ _id: clientId }).then((account: IAccount) => {
          if (account.pickup) {
            if (dateType) {
              const date = (dateType === 'today') ? moment() : moment().add(1, 'day');
              delivered = this.setLocalTime(date, account.pickup).toISOString();
            } else {
              delivered = this.setLocalTime(local, '23:30').toISOString();
            }
          } else {
            if (phases && phases.length > 0) {
              // const created: any = order.created; // utc date time string
              delivered = this.getDeliveryDateTimeByPhase(created, phases, dateType);
            } else {
              delivered = this.setLocalTime(local, '23:30').toISOString();
            }
          }
          resolve(delivered);
        });
      }
    });
  }

  createMobilePlanOrders() {
    const self = this;
    this.cellApplicationModel.joinFind({ status: CellApplicationStatus.STARTED }).then((cas: ICellApplication[]) => {
      const accountIds: any[] = [];
      cas.map((ca: ICellApplication) => {
        accountIds.push(ca.accountId);
        const items: IOrderItem[] = [{
          productId: ca.productId.toString(),
          productName: ca.product.name,
          quantity: 1,
          price: ca.product.price,
          cost: ca.product.cost
        }];

        // orders.push(order);
        setTimeout(() => {
          const account: any = ca.account;
          const merchant: any = ca.merchant;
          const order: IOrder = {
            clientId: ca.accountId.toString(),
            clientName: account ? account.username : 'N/A',
            merchantId: ca.product.merchantId.toString(),
            merchantName: merchant ? merchant.username : 'N/A', // fix me
            items: items,
            price: Math.round(+ca.product.price * 100) / 100,
            cost: Math.round(+ca.product.cost * 100) / 100,
            address: ca.address,
            location: {
              streetNumber: '30', streetName: 'Fulton Way', city: 'Toronto', province: 'ON', country: 'CA', postalCode: '',
              subLocality: 'RichmondHill', placeId: 'ChIJlQu-m1fTKogRNj4OtKn7yD0', lat: 43.983012, lng: -79.3906583
            }, // fix me!!!
            note: 'Mobile Plan Monthly Fee',
            deliveryCost: Math.round(0 * 100) / 100,
            deliveryDiscount: Math.round(0 * 100) / 100,
            groupDiscount: Math.round(0 * 100) / 100,
            overRangeCharge: Math.round(0 * 100) / 100,
            total: Math.round(+ca.product.price * 1.13 * 100) / 100,
            tax: Math.round(+ca.product.price * 0.13 * 100) / 100,
            tips: Math.round(0 * 100) / 100,
            type: OrderType.MOBILE_PLAN_MONTHLY,
            status: OrderStatus.NEW,
            paymentMethod: 'recurring prepay'
          };

          self.doInsertOne(order).then(() => {

          });
        }, 500);
      });
    });
  }


  doInsertOne(order: IOrder) {
    const location: ILocation = order.location;

    return new Promise((resolve, reject) => {
      this.sequenceModel.reqSequence().then((sequence: number) => {
        order.code = this.sequenceModel.getCode(location, sequence);
        order.created = moment.utc().toISOString();

        const orderType: any = order.type;
        const dateType: any = order.dateType;
        const clientId = order.clientId;
        const merchantId = order.merchantId.toString();
        const createdStr = order.created;

        this.merchantModel.findOne({ _id: merchantId }).then((merchant: IDbMerchant) => {
          const phases = merchant ? merchant.phases : [];
          this.getDeliveryDateTime(orderType, dateType, clientId, phases, createdStr).then((utcDeliveredStr) => {
            order.delivered = utcDeliveredStr;
            delete order.dateType;

            this.insertOne(order).then((savedOrder: IOrder) => {
              const merchantName = order.merchantName;
              const clientId: string = order.clientId.toString();
              const clientName = order.clientName;
              const cost = order.cost;
              const total = order.total;
              const deliverd: any = order.delivered;

              // temporary order didn't update transaction until paid
              if (order.status === OrderStatus.TEMP) { // fix me
                resolve(savedOrder);
              } else {
                const orderId: any = savedOrder._id;
                const merchantAccountId = merchant.accountId.toString();
                this.transactionModel.saveTransactionsForPlaceOrder(orderId.toString(), merchantAccountId, merchantName, clientId, clientName, cost, total, deliverd).then(() => {
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
          this.updateOne({ _id: orderId }, { status: OrderStatus.DELETED }).then(x => {
            // temporary order didn't update transaction until paid
            if (order.status === OrderStatus.TEMP) {
              resolve(order);
            } else {
              const merchantId: string = order.merchantId.toString();
              const merchantName = order.merchantName;
              const clientId: string = order.clientId.toString();
              const clientName = order.clientName;
              const cost = order.cost;
              const total = order.total;
              const delivered = order.deliverd;

              this.merchantModel.findOne({ _id: merchantId }).then((merchant: IDbMerchant) => {
                this.transactionModel.updateMany({ orderId: orderId }, { status: OrderStatus.DELETED }).then(() => { // ??
                  const merchantAccountId = merchant.accountId.toString();
                  this.transactionModel.saveTransactionsForRemoveOrder(orderId, merchantAccountId, merchantName, clientId, clientName,
                    cost, total, delivered).then(() => {
                      resolve(order);
                    });
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
  //   this.find({ delivered: date, address: address, status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] } }).then(orders => {
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
  // addGroupDiscounts(clientId: string, orders: any[]): Promise<any> {
  //   // this.find({ delivered: date, address: address, status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] } }).then(orders => {
  //   const others = orders.filter((x: any) => x.clientId && x.clientId.toString() !== clientId.toString()); // fix me!!!
  //   // others > 0 then affect other orders and balances
  //   const orderUpdates = this.getUpdatesForAddGroupDiscount(others, 2);

  //   return new Promise((resolve, reject) => {
  //     if (orderUpdates && orderUpdates.length > 0) {
  //       this.bulkUpdate(orderUpdates, {}).then((r: BulkWriteOpResultObject) => {
  //         resolve(orderUpdates);
  //       });
  //     } else {
  //       resolve(orderUpdates);
  //     }
  //   });
  // }

  // date: string, address: string
  // removeGroupDiscounts(orders: any[]): Promise<any> {
  //   const orderUpdates = this.getUpdatesForRemoveGroupDiscount(orders, 2);
  //   return new Promise((resolve, reject) => {
  //     if (orderUpdates && orderUpdates.length > 0) {
  //       this.bulkUpdate(orderUpdates, {}).then((r: BulkWriteOpResultObject) => {
  //         resolve(orderUpdates);
  //       });
  //     } else {
  //       resolve(orderUpdates);
  //     }
  //   });
  // }

  // deprecated
  replace(req: Request, res: Response) {
    this.replaceById(req.body.id, req.body).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      // io.emit('updateOrders', x);
      res.end(JSON.stringify(x, null, 3));
    });
  }

  // deprecated
  //--------------------------------------------------------------------------------
  // The client can only get one group discount, if he/she has multiple orders.
  // getUpdatesForAddGroupDiscount(orders: IOrder[], groupDiscount: number) {
  //   const groups = this.groupBy(orders, 'clientId');
  //   const a: any[] = [];
  //   Object.keys(groups).map(key => {
  //     const os = groups[key];
  //     if (os && os.length > 0) {
  //       const hasGroupDiscount = os.find((x: IOrder) => x.groupDiscount !== 0);
  //       if (hasGroupDiscount) {
  //         // pass
  //       } else {
  //         const order = os[0];
  //         const amount = Math.round(((order.total ? order.total : 0) - groupDiscount) * 100) / 100;
  //         a.push({
  //           query: { _id: order._id.toString() },
  //           data: { total: amount, groupDiscount: groupDiscount }
  //         });
  //       }
  //     }
  //   });
  //   return a;
  // }

  // deprecated
  // checkGroupDiscount(req: Request, res: Response) {
  //   const clientId: string = req.body.clientId;
  //   const merchantId: string = req.body.merchantId;
  //   const dateType: string = req.body.dateType;
  //   const address: string = req.body.address;

  //   this.eligibleForGroupDiscount(clientId, merchantId, dateType, address).then((bEligible: boolean) => {
  //     res.setHeader('Content-Type', 'application/json');
  //     res.end(JSON.stringify(bEligible, null, 3));
  //   });
  // }

  // deprecated
  eligibleForGroupDiscount(clientId: string, merchantId: string, dateType: string, address: string): Promise<boolean> {
    const date = dateType === 'today' ? moment() : moment().add(1, 'day');
    const range = { $gte: date.startOf('day').toISOString(), $lte: date.endOf('day').toISOString() };
    const query = { delivered: range, address: address, status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] } };

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

  // deprecated
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

  // deprecated
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

  //       this.updateOne({ id: orderId }, { status: OrderStatus.DELETED }).then(x => { // set order status to del

  //         this.find({ delivered: date, address: address, status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] } }).then(orders => {

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

  // deprecated
  //-------------------------------------------------------
  // pickupTime (string) --- eg. '11:20', '12:00'
  updateDeliveryTime(req: Request, res: Response) {
    const pickupTime: string = req.body.pickup;
    const orderId: string = req.body.orderId;
    const delivered: string = this.getLocalTime(moment(), pickupTime).toISOString();

    this.updateOne({ _id: orderId }, { delivered: delivered }).then((result) => {
      this.find({ _id: orderId }).then((orders: IOrder[]) => {
        const order = orders[0];
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(order, null, 3));
      });
    });
  }


  // --------------------------------------------------------------------------------------
  // process after payment gateway success
  // 1.update payment status to 'paid'
  // 2.add two transactions for place order and add another transaction for deposit to bank
  // 3.update account balance
  doProcessPayment(order: IOrder, action: string, paid: number, chargeId: string) {
    const orderId: any = order._id;
    const merchantId: string = order.merchantId.toString();
    const merchantName = order.merchantName;
    const clientId: string = order.clientId.toString();
    const clientName = order.clientName;
    const cost = order.cost;
    const total = order.total;
    const deliverd: any = order.delivered;

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
        orderId.toString(),
        merchantId,
        merchantName,
        clientId,
        clientName,
        cost,
        total,
        deliverd
      ).then(() => {
        this.transactionModel.doInsertOne(tr).then(t => {
          if (t) {
            // change the status tmp to new !!!
            const data = { status: OrderStatus.NEW, paymentStatus: PaymentStatus.PAID, chargeId: chargeId, transactionId: t._id };
            this.updateOne({ _id: orderId }, data).then((r: any) => { // result eg. {n: 1, nModified: 0, ok: 1}
              resolve(r);
            });
          } else {
            resolve();
          }
        });
      });
    });
  }


  // tools
  updatePurchaseTag(req: Request, res: Response) {
    this.accountModel.find({ type: { $nin: ['system', 'merchant', 'driver'] } }).then(accounts => {
      this.distinct('clientId', { status: { $nin: [OrderStatus.DELETED, OrderStatus.TEMP] } }).then((clientIds: any[]) => {
        const datas: any[] = [];
        clientIds.map(clientId => {
          const account = accounts.find((a: any) => a._id.toString() === clientId.toString());
          if (account) {
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

  //-----------------------------------------------------------------------------------------
  // change order status to 'paid', insert a new transaction and update corresponding balance
  pay(toId: string, toName: string, received: number, orderId: string, note?: string) {
    const data = {
      paymentStatus: PaymentStatus.PAID,
      driverId: toId,
      driverName: toName
    };

    return new Promise((resolve, reject) => {
      this.updateOne({ _id: orderId }, data).then(rt => {
        this.findOne({ _id: orderId }).then(order => {
          const tr = {
            orderId: order ? order._id.toString() : '', // fix me
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
      // this.assignmentModel.updateOne({ 'orderId': orderId }, { status: 'done' }).then(() => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'success' }, null, 3));
      // });
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

  getOrderTrends(req: Request, res: Response) {
    const query = {
      // delivered: { $gt: moment('2019-06-01').toDate() },
      status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] }
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

  // date --- '2019-11-15'
  getSummary(type: OrderType, date: string) {
    const self = this;

    const dt = moment(date);
    const range = { $gt: dt.startOf('day').toISOString(), $lt: dt.endOf('day').toISOString() };
    const q = { type: type, delivered: range, status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] } };
    this.joinFind(q).then((orders: IOrder[]) => {
      const orderIds: string[] = [];
      orders.map(order => {
        const orderId: any = order._id;
        order.code = order.code ? order.code : 'N/A';
        orderIds.push(orderId.toString());
      });

      const tQuery = { orderId: { $in: orderIds }, action: 'client pay cash' };
      this.transactionModel.find(tQuery).then((ts: ITransaction[]) => {

      });
    });
  }


  loadPage(req: Request, res: Response) {
    const itemsPerPage = +req.params.itemsPerPage;
    const currentPageNumber = +req.params.currentPageNumber;

    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    if (query.hasOwnProperty('pickup')) {
      query.delivered = this.getPickupDateTime(query['pickup']);
      delete query.pickup;
    }
    let q = query ? query : {};

    this.accountModel.find({}).then(accounts => {
      this.merchantModel.find({}).then(ms => {
        this.productModel.find({}).then(ps => {
          this.find(q).then((rs: any) => {

            const arrSorted = rs.sort((a: IOrder, b: IOrder) => {
              const ma = moment(a.delivered).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
              const mb = moment(b.delivered).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
              if (ma.isAfter(mb)) {
                return -1;
              } else if (mb.isAfter(ma)) {
                return 1;
              } else {
                const ca = moment(a.created);
                const cb = moment(b.created);
                if (ca.isAfter(cb)) {
                  return -1;
                } else {
                  return 1;
                }
              }
            });

            const start = (currentPageNumber - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const len = arrSorted.length;
            const arr = arrSorted.slice(start, end);

            arr.map((order: any) => {
              const items: any[] = [];
              order.client = accounts.find((a: any) => a._id.toString() === order.clientId.toString());
              order.merchant = ms.find((m: any) => m._id.toString() === order.merchantId.toString());
              order.merchantAccount = accounts.find((a: any) => a && order.merchant && a._id.toString() === order.merchant._id.toString());

              order.items.map((it: any) => {
                const product = ps.find((p: any) => p._id.toString() === it.productId.toString());
                if (product) {
                  items.push({ product: product, quantity: it.quantity, price: it.price, cost: it.cost });
                }
              });
              order.items = items;
            });

            res.setHeader('Content-Type', 'application/json');
            if (arr && arr.length > 0) {
              res.send(JSON.stringify({ total: len, orders: arr }, null, 3));
            } else {
              res.send(JSON.stringify({ total: len, orders: [] }, null, 3));
            }

          });
        });
      });
    });
  }

  reqLatestViewed(req: Request, res: Response) {
    this.getLatestViewed().then(rs => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(rs, null, 3));
    });
  }

  getLatestViewed() {
    const range = { $gte: moment().startOf('day').toISOString(), $lte: moment().endOf('day').toISOString() };
    const query: any = {
      delivered: range,
      type: OrderType.FOOD_DELIVERY,
      status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] }
    };

    return new Promise((resolve, reject) => {
      this.find(query).then((orders: any) => {
        this.logModel.getAllLatest(Action.VIEW_ORDER, AccountType.MERCHANT).then((logs: any[]) => {
          let rs: any[] = [];
          logs.map((log: any) => { // each log has only one merchant
            const dt = moment(log.created);
            const merchantId = log.merchantId.toString();
            const its = orders.filter((order: IOrder) => order.merchantId.toString() === merchantId && moment(order.modified).isSameOrBefore(dt));
            if (its && its.length > 0) {
              rs = rs.concat(its);
            }
          });

          resolve(rs);
        });
      });
    });
  }
  // tools

  reqStatisticsByClient(req: Request, res: Response) {
    this.getStatisticsByClient().then(rs => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(rs, null, 3));
    });
  }

  groupByClientId(items: IOrder[]) {
    const groups: any = {};
    items.map(it => {
      if (it.clientId) {
        const clientId = it.clientId.toString();
        const found = Object.keys(groups).find(cId => cId.toString() === clientId);

        if (found) {
          groups[clientId].push(it);
        } else {
          groups[clientId] = [it];
        }
      } else {
        console.log('Bad order: ' + it._id);
      }
    });

    return groups;
  }

  getStatisticsByClient() {
    const query = {
      status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] }
    };

    return new Promise((resolve, reject) => {
      this.accountModel.find({}).then(accounts => {
        this.find(query).then(orders => {
          const groups = this.groupByClientId(orders);
          const rs: any[] = [];
          Object.keys(groups).map(key => {
            const group = groups[key];
            if (group && group.length > 0) {
              const order = group[0];
              if (order.clientId) {
                const client = accounts.find((a: any) => a._id.toString() === order.clientId.toString());
                if (client) {
                  if (client.password) {
                    delete client.password;
                  }
                  order.client = client;
                }
              } else {
                console.log(order._id);
              }
              const date = this.getFirstAndLastDeliverDate(group);
              if (date) {
                const phone = order.client ? order.client.phone : 'N/A';
                rs.push({ clientId: key, clientName: order.clientName, clientPhoneNum: phone,
                  nOrders: group.length, firstOrdered: date.first, lastOrdered: date.last,
                  frequency: Math.round( group.length / date.nDays * 100) / 100
                });
              }
            }
          });

          const ret = rs.sort((a: any, b: any) => {
            if (a.lastOrdered) {
              if (moment(a.lastOrdered).isSameOrAfter(moment(b.lastOrdered))) {
                return 1;
              } else {
                return -1;
              }
            } else {
              return -1;
            }
          });

          resolve(ret);
        });
      });
    });
  }

  getFirstAndLastDeliverDate(orders: IOrder[]) {
    if (orders && orders.length > 0) {
      let last = moment('2019-01-01T00:00:00.000Z');
      let first = moment();
      orders.map(order => {
        const dt = moment(order.delivered);
        if (dt.isSameOrAfter(last)) {
          last = dt;
        }
        if (dt.isSameOrBefore(first)) {
          first = dt;
        }
      });
      return { first: first, last: last, nDays: last.diff(first, 'days')+1 };
    } else {
      return null;
    }
  }

}