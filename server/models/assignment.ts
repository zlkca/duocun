import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";

export class Assignment extends Model{
  constructor(dbo: DB) {
		super(dbo, 'assignments');
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

    if(q && q.merchantId && typeof q.merchantId === 'string' && q.merchantId.length === 24){
      q.merchantId = new ObjectID(q.merchantId);
    } else if (q.merchantId && q.merchantId.hasOwnProperty('$in')) {
      let a = q.merchantId['$in'];
      const arr: any[] = [];
      a.map((id: string) => {
        arr.push(new ObjectID(id));
      });

      q.merchantId = { $in: arr };
    }

    const params = [
      {$lookup:{from: 'drivers', localField: 'driverId', foreignField: 'accountId', as: 'driver'}},
      {$unwind:'$driver'},
      {$lookup:{from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order'}},
      {$unwind:'$order'}
    ];
    this.join(params, q).then((rs: any) => {
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
}