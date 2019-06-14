import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import * as moment from 'moment';

export class OrderSequence extends Model {
    constructor(dbo: DB) {
        super(dbo, 'order_sequences');
    }

    generate(req: Request, res: Response) {
        const today = moment();
        const range = { "created": { "$gte": new Date(), "$lt": new Date(2012, 7, 15) } })
        // this.findOne()
        if (req.body instanceof Array) {
            // this.insertMany(req.body).then((x: any) => {
            //     res.setHeader('Content-Type', 'application/json');
            //     res.end(JSON.stringify(x, null, 3));
            // });
        } else {
        }
    }
}