import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import moment, { now } from 'moment';
import { resolve } from "dns";
import { ILocation } from "./location";


export class OrderSequence extends Model {
  constructor(dbo: DB) {
    super(dbo, 'order_sequences');
  }

  generate(req: Request, res: Response) {
    this.reqSequence().then(index => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(index, null, 3));
    });
  }

  reqSequence(): Promise<number> {
    const dt = moment().toISOString();
    return new Promise((resolve, reject) => {
      this.findOne({}).then(x => {
        if (x) {
          if (x.index < 100000) {
            const index = x.index + 1;
            this.updateOne({ _id: x._id }, { index: index, modified: dt }).then(() => {
              resolve(index);
            }, err => {
              resolve(index);
            });
          } else {
            this.updateOne({ _id: x._id }, { index: 0, modified: dt }).then(() => {
              resolve(0);
            }, err => {
              resolve(0);
            });
          }
        } else {
          this.insertOne({ index: 0, created: dt, modified: dt }).then(() => {
            resolve(0);
          }, err => {
            resolve(0);
          });
        }
      });
    });
  }

  getCode(location: ILocation, n: number): string {
    const index = n > 9 ? n.toString().slice(-2) : ('0' + n);
    const streetName = location.streetName;
    const street = location.streetNumber + (streetName ? streetName.toUpperCase().replace(/\s/g, '') : '');
    return street.substring(0, 4) + index.substring(0, 2);
  }
}