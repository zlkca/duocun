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
      this.insertOne(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        // fix me
        // io.emit('updateOrders', x);
        res.end(JSON.stringify(x, null, 3));
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




}