import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import moment, { now } from 'moment';
import { resolve } from "dns";

export interface ILocation {
  placeId: string;
  city: string;
  lat: number;
  lng: number;
  postalCode?: string;
  province: string;
  streetName: string;
  streetNumber: string;
  subLocality: string;
}

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

    reqSequence(): Promise<number>{
      const start = moment().startOf('day').toISOString();
      const end = moment().endOf('day').toISOString();
      const range = { "created": { "$gte": start, "$lte": end }};

      return new Promise((resolve, reject) => {
        this.findOne(range).then(x => {
          if(x){
            this.updateOne(range, {index: x.index + 1}).then(() => {
              resolve(x.index + 1);
            }, err => {
              resolve(1);
            });
          }else{
            this.insertOne({index: 1, created: start}).then(() => {
              resolve(1);
            }, err => {
              resolve(1);
            });
          }
        });
      });
    }

    getCode(location: ILocation, n: number): string {
      const regionName: string = location.subLocality ? location.subLocality : location.city;
      const index = n > 9 ? ('' + n) : ('0' + n);
      const streetName = location.streetName.toUpperCase();
      const streetNumber = Number(location.streetNumber);
      const streetNum = streetNumber ? (streetNumber > 9 ? ('' + streetNumber) : ('00' + streetNumber)) : '00';
      return regionName.substring(0, 2).toUpperCase() + index.substring(0, 2) + streetName.substring(0, 1) + streetNum;
    }

    // this.sequenceSvc.generate().pipe(takeUntil(self.onDestroy$)).subscribe(sq => {
    //   //   order.id = this.order.id;
    //   const code = self.getCode(self.delivery.origin, sq);
}