import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import { ILocation } from "./location";
import { BulkWriteOpResultObject } from "../../node_modules/@types/mongodb";
import { resolve } from "../../node_modules/@types/q";

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
  prepaidClient?: boolean;
  merchantId?: string;
  merchantName?: string;
  driverId?: string;
  driverName?: string;
  status?: string;
  note?: string;
  address?: string;
  location?: ILocation; // delivery address
  delivered?: Date;
  created?: Date;
  modified?: Date;
  items?: IOrderItem[];
  tax?: number;
  tips?: number;
  // deliveryAddress?: Address; // duplicated should remove
  deliveryCost?: number;
  deliveryDiscount?: number;
  overRangeCharge?: number;
  groupDiscount?: number;
  productTotal?: number;
  total?: number;
  paymentMethod?: string;
  chargeId?: string; // stripe chargeId
  transactionId?: string;
}

export class Order extends Model {
  private clientBalanceEntity: Entity;

  constructor(dbo: DB) {
    super(dbo, 'orders');

    this.clientBalanceEntity = new Entity(dbo, 'client_balances');
  }

  create(req: Request, res: Response) {
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

  //---------------------------------------------------------------------
  // The client has to have the balance entry {accountId: x, amount: y}
  // body --- {clientId:c, delivered:x, address:y, groupDiscount: z}
  createOne(body: any, cb: any) {
    const date = body.delivered;
    const address = body.address;
    this.find({ delivered: date, address: address, status: { $nin: ['bad', 'del'] } }).then(orders => {
      let newGroupDiscount = body.groupDiscount;
      const others = orders.filter((x: any) => x.clientId && x.clientId !== body.clientId);
      const orderUpdates = this.getOrdersToAddGroupDiscount(others, newGroupDiscount);

      if (orderUpdates && orderUpdates.length > 0) {
        this.bulkUpdate(orderUpdates, {}).then((r: BulkWriteOpResultObject) => {
          const clientIds: string[] = [];
          orderUpdates.map(item => { clientIds.push(item.data.clientId) });
          this.clientBalanceEntity.find({ accountId: { $in: clientIds } }).then((bs: any[]) => {
            if (bs && bs.length > 0) {
              // const balanceUpdates = this.getBalancesToAddGroupDiscount(others, bs, newGroupDiscount);
              // this.clientBalanceEntity.bulkUpdate(balanceUpdates, {}).then((r1: BulkWriteOpResultObject) => {
              //   this.insertOne(body).then((x: any) => {
              //     cb(x);
              //   });
              // });
            } else {
              this.insertOne(body).then((x: any) => {
                cb(x);
              });
            }
          });
        });
      } else {
        this.insertOne(body).then((x: any) => {
          cb(x);
        });
      }
    });
  }

  // date: string, address: string
  addGroupDiscountForOrders(clientId: string, orders: any[]): Promise<any> {
    // this.find({ delivered: date, address: address, status: { $nin: ['bad', 'del', 'tmp'] } }).then(orders => {
      const others = orders.filter((x: any) => x.clientId && x.clientId !== clientId); // fix me!!!
      // others > 0 then affect other orders and balances
      const orderUpdates = this.getOrdersToAddGroupDiscount(others, 2);

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
  removeGroupDiscountForOrders(orders: any[], cb?: any) {
    const orderUpdates = this.getOrdersToRemoveGroupDiscount(orders, 2);

    if (orderUpdates && orderUpdates.length > 0) {
      this.bulkUpdate(orderUpdates, {}).then((r: BulkWriteOpResultObject) => {
        cb(orderUpdates);
      });
    } else {
      cb(orderUpdates);
    }
  }

  replace(req: Request, res: Response) {
    this.replaceById(req.body.id, req.body).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      // io.emit('updateOrders', x);
      res.end(JSON.stringify(x, null, 3));
    });
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

  //--------------------------------------------------------------------------------
  // The client can only get one group discount, if he/she has multiple orders.
  getOrdersToAddGroupDiscount(orders: any[], groupDiscount: number) {
    const groups = this.groupBy(orders, 'clientId');
    const a: any[] = [];
    Object.keys(groups).map(key => {
      const os = groups[key];
      if ( os && os.length > 0) {
        const hasGroupDiscount = os.find((x: any) => x.groupDiscount !== 0 );
        if(hasGroupDiscount){
          // pass
        }else{
          const order = os[0];
          const amount = Math.round(((order.total ? order.total : 0) - groupDiscount) * 100) / 100;
          a.push({ query: { id: order.id.toString() }, data: { total: amount, groupDiscount: groupDiscount, clientId: order.clientId } });  
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

  eligibleForGroupDiscount(clientId: string, date: string, address: string, cb?: any){
    this.find({ delivered: date, address: address, status: { $nin: ['bad', 'del', 'tmp'] } }).then(orders => {
      const groups = this.groupBy(orders, 'clientId');
      const clientIds = Object.keys(groups);

      if(clientIds && clientIds.length > 0){
        const found = clientIds.find(x => x === clientId);
        if(found){
          if(clientIds.length === 1){ // only me
            cb(false);
          }else { // > 1, has other clients
            const os = groups[clientId];
            if ( os && os.length > 0) {
              const hasGroupDiscount = os.find((x: any) => x.groupDiscount !== 0 );
              if(hasGroupDiscount){
                cb(false);
              }else{
                cb(true);
              }
            }else{
              cb(true); // [] should not happen
            }
          }
        }else{
          cb(true);
        }
      }else{
        cb(false);
      }
    });
  }

  //--------------------------------------------------------------------------------
  // call after remove order
  // The client can only get one group discount, if he/she has multiple orders.
  getOrdersToRemoveGroupDiscount(orders: any[], groupDiscount: number) {
    const groups = this.groupBy(orders, 'clientId');
    const clientIds = Object.keys(groups);
    
    if(clientIds && clientIds.length > 1){ // only need to check update current client's 2nd order
      const a: any[] = [];
      Object.keys(groups).map(key => {
        const group = groups[key];
        if ( group && group.length > 0) {
          const order = group.find((x: any) => x.groupDiscount !== 0 );
          if(order){
            // pass this group
          }else{
            const newOrderWithGroupDiscount = group[0];
            const amount = Math.round((newOrderWithGroupDiscount.total - groupDiscount) * 100) / 100;
            a.push({ 
              query: { id: newOrderWithGroupDiscount.id.toString() },
              data: { total: amount, groupDiscount: groupDiscount, clientId: newOrderWithGroupDiscount.clientId }
            });  
          }
        }
      });
      return a;
    }else{ // <= 1
      const a: any[] = [];
      Object.keys(groups).map(key => {
        const os = groups[key];
        if ( os && os.length > 0) {
          const order = os.find((x: any) => x.groupDiscount !== 0 );
          if(order){
            const amount = Math.round(((order.total ? order.total : 0) + groupDiscount) * 100) / 100;
            a.push({ query: { id: order.id.toString() }, data: { total: amount, groupDiscount: 0, clientId: order.clientId } });  
          }else{
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

  //           const orderUpdates = this.getOrdersToRemoveGroupDiscount(orders,  2);
  //           // const balanceUpdates = this.getBalancesToRemoveGroupDiscount(orders, balances, 2);
          
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

  removeOne(req: Request, res: Response) {
    const orderId = req.params.id;
    this.find({ id: orderId }).then(docs => {
      if (docs && docs.length > 0) {

        this.updateOne({ id: orderId }, { status: 'del' }).then(x => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(x, null, 3));

          // const date = docs[0].delivered;
          // const address = docs[0].address;  
          // this.find({ delivered: date, address: address, status: { $nin: ['del', 'bad'] } }).then(orders => {
          //   const a = this.getDistinctArray(orders, 'clientId');
          //   let groupDiscount = (a && a.length > 1) ? 2 : 0;

          //   if (groupDiscount === 0) {
          //     const os = a.filter(x => x.groupDiscount !== 0);
          //     if (os && os.length > 0) {
          //       const order = os[0];
          //       this.updateOne({ id: order.id }, { groupDiscount: 0, total: order.total + 2 }).then(() => {
          //         console.log('update order:' + order.id);
          //         this.clientBalanceEntity.find({ accountId: order.clientId }).then((bs: any[]) => {
          //           if (bs && bs.length > 0) {
          //             const b = bs[0];
          //             this.clientBalanceEntity.updateOne({ accountId: order.clientId }, { amount: b.amount - 2 }).then(() => {
          //               res.setHeader('Content-Type', 'application/json');
          //               res.end(JSON.stringify(x, null, 3));
          //             });
          //           } else {
          //             res.setHeader('Content-Type', 'application/json');
          //             res.end(JSON.stringify(x, null, 3));
          //           }
          //         });
          //       });
          //     } else {
          //       res.setHeader('Content-Type', 'application/json');
          //       res.end(JSON.stringify(x, null, 3));
          //     }
          //   } else {
          //     res.setHeader('Content-Type', 'application/json');
          //     res.end(JSON.stringify(x, null, 3));
          //   }
          // });
        });
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(null, null, 3));
      }
    });
  }
}