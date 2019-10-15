import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";

export class Transaction extends Model{
  constructor(dbo: DB) {
		super(dbo, 'transactions');
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

    if(q && q.fromId && typeof q.fromId === 'string' && q.fromId.length === 24){
      q.fromId = new ObjectID(q.fromId);
    } else if (q.fromId && q.fromId.hasOwnProperty('$in')) {
      let a = q.fromId['$in'];
      const arr: any[] = [];
      a.map((id: string) => {
        arr.push(new ObjectID(id));
      });

      q.fromId = { $in: arr };
    }

    if(q && q.toId && typeof q.toId === 'string' && q.toId.length === 24){
      q.toId = new ObjectID(q.toId);
    } else if (q.toId && q.toId.hasOwnProperty('$in')) {
      let a = q.toId['$in'];
      const arr: any[] = [];
      a.map((id: string) => {
        arr.push(new ObjectID(id));
      });

      q.toId = { $in: arr };
    }

    const params = [
      {$lookup:{from: 'users', localField: 'fromId', foreignField: '_id', as: 'from'}},
      {$unwind:'$from'},
      {$lookup:{from: 'users', localField: 'toId', foreignField: '_id', as: 'to'}},
      {$unwind:'$to'}
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