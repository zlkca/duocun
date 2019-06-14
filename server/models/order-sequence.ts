import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import moment, { now } from 'moment';

export class OrderSequence extends Model {
    constructor(dbo: DB) {
        super(dbo, 'order_sequences');
    }

    generate(req: Request, res: Response) {
      const start = moment().startOf('day').toDate();
      const end = moment().endOf('day').toDate();

      const range = { "created": { "$gte": start, "$lte": end }};
      this.findOne(range).then(x => {
        if(x){
          this.updateOne(range, {index: x.index + 1}).then(() => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(x.index + 1, null, 3));
          });
        }else{
          this.insertOne({index: 1, created: start}).then(() => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(1, null, 3));
          });
        }
      });
    }
}