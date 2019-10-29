import { DB } from "../db";
import { Model } from "./model";
import { ILatLng, Distance } from "./distance";
import { resolve } from "url";

export interface IRange {
  _id?: string;
  name?: string;
  lat: number;
  lng: number;
  radius: number; // meter
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

  isInDeliveryRange(origin: ILatLng) {
    return new Promise((resolve, reject) => {
      const q = { status: 'active', type: 'service' };
      this.find(q).then((rs: any[]) => {
        let ret: boolean = false;
        rs.map(r => {
          const d = this.distanceModel.getDirectDistance(origin, r);
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
      const d = this.distanceModel.getDirectDistance(origin, r);
      if (d < r.radius) {
        ret = true;
      }
    });
    return ret;
  }
}