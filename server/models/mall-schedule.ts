import { DB } from "../db";
import { Model } from "./model";
import { ObjectID, Collection } from "mongodb";
import { Request, Response } from "express";

export class MallSchedule extends Model{
  constructor(dbo: DB) {
		super(dbo, 'mall_schedules');
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

    if(q && q.mallId){
      q.mallId = new ObjectID(q.mallId);
    }

    const params = [
      {$lookup: {from: 'malls', localField: 'mallId', foreignField: '_id', as: 'mall'}},
      {$unwind: '$mall'}
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