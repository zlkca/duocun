import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";

export class Contact extends Model {
  constructor(dbo: DB) {
    super(dbo, 'contacts');
  }

  // list(req: Request, res: Response) {
  //   let query = null;
  //   if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
  //     query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
  //   }

  //   let q = query;
  //   if (q) {
  //     if (q.where) {
  //       q = query.where;
  //     }
  //   } else {
  //     q = {};
  //   }

  //   if(q && q.accountId){
  //     q.accountId = new ObjectID(q.accountId);
  //   }

  //   const params = [
  //     {$lookup: {from: 'users', localField: 'accountId', foreignField: '_id', as: 'account'}},
  //     {$unwind: '$account'}
  //   ];
  //   this.join(params, q).then((rs: any) => {
  //     rs.map((r: any) => {
  //       delete r.password;
  //       delete r.account.password;
  //     });
  //     res.setHeader('Content-Type', 'application/json');
  //     if (rs) {
  //       res.send(JSON.stringify(rs, null, 3));
  //     } else {
  //       res.send(JSON.stringify(null, null, 3))
  //     }
  //   });
  // }
}