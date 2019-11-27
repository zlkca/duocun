import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";
import moment from 'moment';

export class Assignment extends Model {
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

    if (q && q.driverId && typeof q.driverId === 'string' && q.driverId.length === 24) {
      q.driverId = new ObjectID(q.driverId);
    } else if (q.driverId && q.driverId.hasOwnProperty('$in')) {
      let a = q.driverId['$in'];
      const arr: any[] = [];
      a.map((id: string) => {
        arr.push(new ObjectID(id));
      });

      q.driverId = { $in: arr };
    }

    const params = [
      { $lookup: { from: 'drivers', localField: 'driverId', foreignField: 'accountId', as: 'driver' } },
      { $unwind: '$driver' },
      { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
      { $unwind: '$order' }
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


  quickFind(req: Request, res: Response) {
    let query: any = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    if (query.hasOwnProperty('pickup')) {
      const h = +(query['pickup'].split(':')[0]);
      const m = +(query['pickup'].split(':')[1]);
      query.delivered = moment().set({ hour: h, minute: m, second: 0, millisecond: 0 }).toISOString();
      delete query.pickup;
    }

    this.find(query).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(x, null, 3));
    });
  }


  // tools
  changeAccount(req: Request, res: Response) {
    this.find({ driverId: '5cf67ed1d47c19056aaa1091' }).then(trs1 => {
      const datas: any[] = [];
      trs1.map((t: any) => {
        datas.push({
          query: { _id: t._id },
          data: { driverId: '5ddda5edc792cdca1a13c1e2', driverName: 'bonnie2' }
        });
      });

      res.setHeader('Content-Type', 'application/json');
      if (datas && datas.length > 0) {
        this.bulkUpdate(datas).then(() => {
          res.end(JSON.stringify('success', null, 3));
        });
      } else {
        res.end(JSON.stringify(null, null, 3));
      }
    });
  }
}