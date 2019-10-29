import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import { ILocation } from "./location";
import { BulkWriteOpResultObject, ObjectID } from "mongodb";
import { OrderSequence } from "./order-sequence";
import { ClientBalance, IClientBalance } from "./client-balance";
import moment from 'moment';
import { Restaurant } from "./restaurant";


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
  id?: string;
  code?: string;
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  // prepaidClient?: boolean;
  merchantId?: string;
  merchantName?: string;
  driverId?: string;
  driverName?: string;
  status?: string;
  note?: string;
  address?: string;
  location?: ILocation; // delivery address
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
  total: number;
  paymentMethod: string;
  chargeId?: string; // stripe chargeId
  transactionId?: string;

  mode? : string; // for unit test
}

export class Order extends Model {
  private clientBalanceModel: ClientBalance;
  private sequenceModel: OrderSequence;
  private merchantModel: Restaurant;
  constructor(dbo: DB) {
    super(dbo, 'orders');

    this.clientBalanceModel = new ClientBalance(dbo);
    this.sequenceModel = new OrderSequence(dbo);
    this.merchantModel = new Restaurant(dbo);
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

    if (q && q.merchantId && typeof q.merchantId === 'string' && q.merchantId.length === 24) {
      q.merchantId = new ObjectID(q.merchantId);
    } else if (q.merchantId && q.merchantId.hasOwnProperty('$in')) {
      let a = q.merchantId['$in'];
      const arr: any[] = [];
      a.map((id: string) => {
        arr.push(new ObjectID(id));
      });

      q.merchantId = { $in: arr };
    }

    if (q && q.clientId && typeof q.clientId === 'string' && q.clientId.length === 24) {
      q.clientId = new ObjectID(q.clientId);
    } else if (q.clientId && q.clientId.hasOwnProperty('$in')) {
      let a = q.clientId['$in'];
      const arr: any[] = [];
      a.map((id: string) => {
        arr.push(new ObjectID(id));
      });

      q.clientId = { $in: arr };
    }

    const params = [
      { $lookup: { from: 'contacts', localField: 'clientId', foreignField: 'accountId', as: 'client' } },
      { $unwind: '$client' },
      { $lookup: { from: 'restaurants', localField: 'merchantId', foreignField: '_id', as: 'merchant' } },
      { $unwind: '$merchant' },
      { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'products' } },
    ];
    this.join(params, q).then((rs: any) => {
      const cbs: any[] = [];
      rs.map((r: any) => {
        const items: any[] = [];
        r.items.map((it: any) => {
          const product = r.products.find((p: any) => p._id.toString() === it.productId.toString());
          if (product) {
            items.push({ product: product, quantity: it.quantity, price: it.price, cost: it.cost });
          }
        });
        delete r.products;

        r.items = items;

        const cb = cbs.find(x => x._id.toString() === r._id.toString());
        if (!cb) {
          cbs.push(r);
        }
      });

      res.setHeader('Content-Type', 'application/json');
      if (cbs) {
        res.send(JSON.stringify(cbs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3));
      }
    });
  }

  // m --- moment object for date
  // t --- string, eg: '11:20'
  // return moment object 
  getTime(m: any, t: string){
    const hour = +(t.split(':')[0]);
    const minute = +(t.split(':')[1]);
    return m.set({ hour: hour, minute: minute, second: 0, millisecond: 0 });
  }

  getDeliverDateTime(createdDateTime: string, phases: any[], deliveryDate: string){

    if(deliveryDate === 'today'){
      const created = moment(createdDateTime);

      for(let i=0; i<phases.length; i++) {
        const phase = phases[i];
        const orderEndTime = this.getTime(moment(), phase.orderEnd);

        if(i === 0){
          if(created.isSameOrBefore(orderEndTime)){
            return this.getTime(moment(), phase.pickup).toISOString();
          }
        }else{
          const prePhase = phases[i-1];
          const preEndTime = this.getTime(moment(), prePhase.orderEnd);

          if(created.isAfter(preEndTime) && created.isSameOrBefore(orderEndTime)){
            return this.getTime(moment(), phase.pickup).toISOString();
          }
        }
      }
    }else{
      const phase = phases[0];
      return this.getTime(moment().add(1, 'day'), phase.pickup).toISOString();
    }
  }

  create(req: Request, res: Response) {
    const order = req.body;
    this.sequenceModel.reqSequence().then((sequence: number) => {
      order.code = this.sequenceModel.getCode(order.location, sequence);

      this.merchantModel.findOne({_id: order.merchantId}).then((merchant: any) => {

        if(order.defaultPickupTime){
          const date = (order.deliveryDate === 'today') ? moment() : moment().add(1, 'day');
          order.delivered = this.getTime(date, order.defaultPickupTime).toISOString();
        }else{
          order.delivered = this.getDeliverDateTime(order.created, merchant.phases, order.deliveryDate);
        }
        
        delete order.defaultPickupTime;
        delete order.deliveryDate;
  
        this.insertOne(order).then((savedOrder: IOrder) => {
          this.clientBalanceModel.find({ accountId: order.clientId }).then((cbs: IClientBalance[]) => {
            const cb = cbs[0];
            const newBalance = cb.amount - order.total;
            this.clientBalanceModel.updateOne({ _id: cb._id }, { amount: newBalance }).then((x) => { // result
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(savedOrder, null, 3));
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
  
            this.clientBalanceModel.find({ accountId: order.clientId }).then((balances: any[]) => {
              if (balances && balances.length > 0) {
                const balance = balances[0];
                const amount = Math.round((balance.amount + order.total) * 100) / 100;
                this.clientBalanceModel.updateOne({ accountId: order.clientId }, { amount: amount }).then(x => {
                  resolve(x);
                });
              }else{
                resolve();
              }
            });
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
    this.eligibleForGroupDiscount(req.body.clientId, req.body.delivered, req.body.address, (bEligible: boolean) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(bEligible, null, 3));
    });
  }

  eligibleForGroupDiscount(clientId: string, date: string, address: string, cb?: any) {
    this.find({ delivered: date, address: address, status: { $nin: ['bad', 'del', 'tmp'] } }).then(orders => {
      const groups = this.groupBy(orders, 'clientId');
      const clientIds = Object.keys(groups);

      if (clientIds && clientIds.length > 0) {
        const found = clientIds.find(x => x === clientId);
        if (found) {
          if (clientIds.length === 1) { // only me
            cb(false);
          } else { // > 1, has other clients
            const os = groups[clientId];
            if (os && os.length > 0) {
              const hasGroupDiscount = os.find((x: any) => x.groupDiscount !== 0);
              if (hasGroupDiscount) {
                cb(false);
              } else {
                cb(true);
              }
            } else {
              cb(true); // [] should not happen
            }
          }
        } else {
          cb(true);
        }
      } else {
        cb(false);
      }
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

    this.updateOne({_id: orderId}, {delivered: delivered}).then((result) => {
      this.find({_id: orderId}).then((orders: IOrder[]) => {
        const order = orders[0];
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(order, null, 3));
      });
    });
  }
}