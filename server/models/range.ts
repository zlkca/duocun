import { DB } from "../db";
import { Model } from "./model";
import { ILatLng, Distance, ILocation, IDistance } from "./distance";
import { resolve } from "url";
import { Request, Response } from "express";
import { Mall, IMall } from "./mall";
import { Area } from "./area";

export enum RangeRole {
  DISTANCE_CENTER = 1,
  FREE_CENTER = 2,
}

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
  mallModel: Mall;
  areaModel: Area;
  constructor(dbo: DB) {
    super(dbo, 'ranges');
    this.distanceModel = new Distance(dbo);
    this.mallModel = new Mall(dbo);
    this.areaModel = new Area(dbo);
  }

  inDeliveryRangeReq(req: Request, res: Response) {
    const origin = req.body.origin;

    this.inDeliveryRange(origin).then((r: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(r, null, 3));
    });
  }

  findAvailablesReq(req: Request, res: Response) {
    const origin = req.body.origin;
    this.findAvailables(origin).then((rs: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(rs, null, 3));
    });
  }

  inDeliveryRange(origin: ILatLng) {
    return new Promise((resolve, reject) => {
      const q = { status: 'active', type: 'service' };
      this.find(q).then((rs: any[]) => {
        let bInRange: boolean = false;
        rs.map(r => {
          const d = this.distanceModel.getDirectDistance(origin, r); // km
          if (d < r.radius) {
            bInRange = true;
          }
        });
        // if(!bInRange){
        //   this.areaModel.findOne({code:'DT'}).then(area => {
        //     bInRange = this.areaModel.inPolygon(origin, area.coords);
        //     resolve(bInRange);
        //   });
        // }else{
          resolve(bInRange);
        // }
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

  getAvailableRanges(origin: ILatLng, ranges: IRange[]) {
    const self = this;
    const list = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      if (self.distanceModel.getDirectDistance(origin, { lat: r.lat, lng: r.lng }) < r.radius) {
        list.push(r);
      }
    }
    return list;
  }

  // origin --- must include address fields for origin
  // return
  //    distance --- over range km
  getOverRange(origin: ILocation) {
    const self = this;
    const destinations: any[] = []; // IPlace
    const qDist = { _id: '5d671c2f6f69011d1bd42f6c' }; // TNT mall

    return new Promise((resolve, reject) => {

      this.areaModel.inDowntownArea(origin).then(area => {
        if(area){
          resolve({distance: 0, rate: area.rate});
        }else{
          this.find({ roles: [RangeRole.FREE_CENTER] }).then((rs: IRange[]) => {
            const ranges = self.getAvailableRanges({ lat: origin.lat, lng: origin.lng }, rs); // fix me ! origin could be null !
            if (ranges && ranges.length > 0) {
              const r = rs[0];
              resolve({distance: 0, rate: 0});
            } else {
              self.mallModel.find(qDist).then((ms: IMall[]) => {
                ms.map(m => {
                  destinations.push({ lat: m.lat, lng: m.lng, placeId: m.placeId });
                });
    
                self.distanceModel.loadRoadDistances(origin, destinations).then((ds: IDistance[]) => {
                  if (ds && ds.length > 0) {
                    const r = rs[0];
                    const d = (+(ds[0].element.distance.value) - r.radius * 1000) / 1000; // km
                    const distance = d > 0 ? d : 0; // kilo meter
                    resolve({distance: distance, rate: r.overRangeRate});
                  } else {
                    resolve({distance: 5, rate: 0}); // should never go here
                  }
                }, err => {
                  console.log(err);
                  resolve({distance: 0, rate: 0});
                });
              });
            }
          });
        }
      });
    });
  }

  getOverRangeReq(req: Request, res: Response) {
    const origin = req.body.origin;
    this.getOverRange(origin).then((r: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(r, null, 3));
    });
  }
}