import { DB } from "../db";
import { Model } from "./model";
import { ILatLng, Distance } from "./distance";
import { resolve } from "url";
import { Request, Response } from "express";

export interface IRange {
  _id?: string;
  name?: string;
  lat: number;
  lng: number;
  radius: number; // km
  overRangeRate?: number;
  created?: string;
  modified?: string;
}

export class Range extends Model {
  distanceModel: Distance;
  constructor(dbo: DB) {
    super(dbo, 'ranges');
    this.distanceModel = new Distance(dbo);
  }

  inDeliveryRangeReq(req: Request, res: Response) {
    const origin = req.body.origin;

    this.inDeliveryRange(origin).then((r: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(r, null, 3));
    });
  }

  findAvailablesReq(req: Request, res: Response) {
    const origin = req.body.origin;
    this.findAvailables(origin).then((rs: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(rs, null, 3));
    });
  }

  inDeliveryRange(origin: ILatLng) {
    return new Promise((resolve, reject) => {
      const q = { status: 'active', type: 'service' };
      this.find(q).then((rs: any[]) => {
        let ret: boolean = false;
        rs.map(r => {
          const d = this.distanceModel.getDirectDistance(origin, r); // km
          if (d < r.radius) {
            ret = true;
          }
        });
        resolve(ret);
      });
    });
  }

  inRange(origin: ILatLng, ranges: IRange[]) {
    let ret: boolean = false;
    ranges.map((r: IRange) => {
      const d = this.distanceModel.getDirectDistance(origin, r); // km
      if (d < r.radius) {
        ret = true;
      }
    });
    return ret;
  }


  // Find all available ranges
  findAvailables(origin: ILatLng) {
    return new Promise((resolve, reject) => {
      this.find({ status: 'active' }).then((rs: IRange[]) => {
        const ranges: IRange[] = [];
        rs.map((r: IRange) => {
          if (this.distanceModel.getDirectDistance(origin, r) < r.radius) {
            ranges.push(r);
          }
        });
        resolve(ranges);
      });
    });
  }
}