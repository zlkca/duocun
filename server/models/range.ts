import { DB } from "../db";
import { Model } from "./model";
import { ILatLng, Distance } from "./distance";
import { resolve } from "url";

export class Range extends Model {
  distanceModel: Distance;
  constructor(dbo: DB) {
    super(dbo, 'ranges');
    this.distanceModel = new Distance(dbo);
  }

  isInDeliveryRange(origin: ILatLng){
    return new Promise((resolve, reject) => {
      const q = {status: 'active', type: 'service'};
      this.find(q).then((rs: any[]) => {
        let ret: boolean = false;
        rs.map(r => {
          const d = this.distanceModel.getDirectDistance(origin, r);
          if(d < r.radius){
            ret = true;
          }
        });
        resolve(ret);
      });
    });
  }
}