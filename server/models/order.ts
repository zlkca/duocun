import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";

export class Order extends Model {
  private balanceEntity: any;

  constructor(dbo: DB) {
    super(dbo, 'orders');

    this.balanceEntity = new Entity(dbo, 'merchant_balances');
  }

  create(req: Request, res: Response) {
    if (req.body instanceof Array) {
      this.insertMany(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    } else {
      const date = req.body.delivered;
      const address = req.body.address;
      this.find({ delivered: date, address: address, status: { $nin: ['bad', 'del'] }}).then(orders => {
        let newGroupDiscount = req.body.groupDiscount;
        const a = this.getDistinctArray(orders, 'clientId');

        // update other orders
        const os = a.filter(x => x.clientId !== req.body.clientId && x.groupDiscount === 0);
        if (os && os.length > 0) {
          const order = os[0];
          const amount = Math.round((order.total - newGroupDiscount)* 100)/100;
          this.updateOne({ id: order.id }, { groupDiscount: newGroupDiscount, total: amount }).then(() => {
            console.log('update order:' + order.id);

            this.balanceEntity.find({ accountId: order.clientId }).then((bs: any[]) => {
              if (bs && bs.length > 0) {
                const b = bs[0];
                const balance = Math.round((b.amount + newGroupDiscount)* 100)/100;
                this.balanceEntity.updateOne({ accountId: order.clientId }, { amount: balance }).then(() => {
                  this.insertOne(req.body).then((x: any) => {
                    res.setHeader('Content-Type', 'application/json');
                    // fix me
                    // io.emit('updateOrders', x);
                    res.end(JSON.stringify(x, null, 3));
                  });
                });
              }else{
                this.insertOne(req.body).then((x: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  // fix me
                  // io.emit('updateOrders', x);
                  res.end(JSON.stringify(x, null, 3));
                });
              }
            });
          });
        }else{
          this.insertOne(req.body).then((x: any) => {
            res.setHeader('Content-Type', 'application/json');
            // fix me
            // io.emit('updateOrders', x);
            res.end(JSON.stringify(x, null, 3));
          });
        }
      });
    }
  }

  replace(req: Request, res: Response) {
    this.replaceById(req.body.id, req.body).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      // io.emit('updateOrders', x);
      res.end(JSON.stringify(x, null, 3));
    });
  }

  getDistinctArray(items: any, field: string) {
    const a: any[] = [];
    items.map((item: any) => {
      const b = a.find(x => x[field] === item[field]);
      if (!b) {
        a.push(item);
      }
    });
    return a;
  }

  removeOne(req: Request, res: Response) {
    const orderId = req.params.id;
    this.find({ id: orderId }).then(docs => {
      if (docs && docs.length > 0) {
        const date = docs[0].delivered;
        const address = docs[0].address;

        this.updateOne({ id: orderId }, { status: 'del' }).then(x => {
          this.find({ delivered: date, address: address, status: { $nin: ['del', 'bad'] } }).then(orders => {
            const a = this.getDistinctArray(orders, 'clientId');
            let groupDiscount = (a && a.length > 1) ? 2 : 0;

            if (groupDiscount === 0) {
              const os = a.filter(x => x.groupDiscount !== 0);
              if (os && os.length > 0) {
                const order = os[0];
                this.updateOne({ id: order.id }, { groupDiscount: 0, total: order.total + 2 }).then(() => {
                  console.log('update order:' + order.id);
                  this.balanceEntity.find({ accountId: order.clientId }).then((bs: any[]) => {
                    if (bs && bs.length > 0) {
                      const b = bs[0];
                      this.balanceEntity.updateOne({ accountId: order.clientId }, { amount: b.amount - 2 }).then(() => {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(x, null, 3));
                      });
                    }else{
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(x, null, 3));
                    }
                  });
                });
              }else{
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(x, null, 3));
              }
            }else{
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(x, null, 3));
            }
          });
        });
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(null, null, 3));
      }
    });
  }
}