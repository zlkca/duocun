import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";

export class Order extends Model {
  constructor(dbo: DB) {
    super(dbo, 'orders');
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
      this.find({delivered: date, address: address}).then(orders => {
        let newGroupDiscount = req.body.groupDiscount;
        orders.map((order: any) => {
          const total = order.total + (order.groupDiscount? order.groupDiscount : 0);
          this.updateOne({id: order.id}, {groupDiscount: newGroupDiscount, total: total - newGroupDiscount}).then(()=>{
            console.log('update order:' + order.id);
          });
        });

        this.insertOne(req.body).then((x: any) => {
          res.setHeader('Content-Type', 'application/json');
          // fix me
          // io.emit('updateOrders', x);
          res.end(JSON.stringify(x, null, 3));
        });
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


  removeOne(req: Request, res: Response) {
    this.find({id: req.params.id}).then(docs => {
      if(docs && docs.length>0){
        const date = docs[0].delivered;
        const address = docs[0].address;
  
        // this.deleteById(req.params.id).then(x => {
        this.updateOne({id: req.params.id}, {status: 'del'}).then(x => {
          this.find({delivered: date, address: address, status: { $nin: ['del', 'bad']}}).then(orders => {
            let groupDiscount = 0;
            if (orders && orders.length > 1) {
              groupDiscount = 2;
            } else {
              groupDiscount = 0;
            }
            orders.map((order: any) => {
              const total = order.total + (order.groupDiscount? order.groupDiscount : 0);
              this.updateOne({id: order.id}, {groupDiscount: groupDiscount, total: total - groupDiscount}).then(()=>{
                // console.log('update order:' + order.id);
              });
            });
          });
  
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(x, null, 3));
        });
      }else{
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(null, null, 3));
      }
    });
  }
}