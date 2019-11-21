import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import { Mall, IMall } from "./mall";
import { Distance, ILocation, IDistance } from "./distance";
import { Area, ILatLng, IArea } from "./area";
import { Range, IRange } from './range';

import { Request, Response } from "express";
import { ObjectID, Collection } from "mongodb";
import moment from "moment";
import { resolve } from "path";

// ------------- interface v2 ----------------
export interface IPhase {
  orderEnd: string; // hh:mm
  pickup: string; // hh:mm
}

export interface IRestaurant {
  _id: string;
  name: string;
  description: string;
  location: ILatLng; // lat lng
  ownerId: string;
  malls: string[]; // mall id
  created: Date;
  modified: Date;
  closed?: Date[];
  dow?: string; // day of week opening, eg. '1,2,3,4,5'
  pictures: string[];
  address: string;
  order?: number;
  startTime?: string;
  endTime?: string;
  // inRange: boolean;
  onSchedule: boolean;
  phases: IPhase[];

  mall: IMall;
}

export class Restaurant extends Model {
  mall: Mall;
  distance: Distance;
  area: Area;
  range: Range;

  constructor(dbo: DB) {
    super(dbo, 'restaurants');
    this.mall = new Mall(dbo);
    this.distance = new Distance(dbo);
    this.area = new Area(dbo);
    this.range = new Range(dbo);
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

    if (q && q._id) {
      q._id = new ObjectID(q._id);
    }

    if (q && q.mallId) {
      q.mallId = new ObjectID(q.mallId);
    }

    const params = [
      { $lookup: { from: 'malls', localField: 'mallId', foreignField: '_id', as: 'mall' } },
      { $unwind: '$mall' }
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

  // only central area have phase 2 delivery
  isOrderEnded(dt: moment.Moment, origin: ILocation, area: IArea, r: IRestaurant, rs: IRange[]) {
    const last = area.code === 'C'? r.phases[r.phases.length - 1].orderEnd : r.phases[0].orderEnd;
    const first = r.phases[0].orderEnd;
    if (moment().isAfter(this.getTime(dt, last))) {
      return true;
    } else {
      if (moment().isAfter(this.getTime(dt, first))) {
        if (this.range.inRange(origin, rs)) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

  getOrderEndTime(origin: ILocation, area: IArea, r: IRestaurant, rs: IRange[]) {
    const last = area.code === 'C'? r.phases[r.phases.length - 1].orderEnd : r.phases[0].orderEnd;
    const first = r.phases[0].orderEnd;
    if (this.range.inRange(origin, rs)) {
      return last;
    } else {
      return first;
    }
  }

  // ----------------------------------------------------------------------------
  // dow ---- string '0,1,2,3,4,5,6'
  // dt --- moment object
  isOpeningDayOfWeek(dt: moment.Moment, dow: string) {
    if (dow && dt) {
      const days = dow.split(',');
      if (days && days.length > 0) {
        const r = days.find(d => +d === dt.day());
        return r ? true : false;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // ------------------------------------------------------------------------------
  // specialClosingDates --- array of string, eg. ['2019-10-22T15:47:56.480Z', ...]
  // dow ---- string '0,1,2,3,4,5,6'
  // dt --- moment object
  isClosed(dt: moment.Moment, specialClosingDates: string[], dow: string) {
    if (specialClosingDates) { // has special close day
      if (specialClosingDates.find(d => moment(d).isSame(dt, 'day'))) {
        return true;
      } else {
        return !this.isOpeningDayOfWeek(dt, dow);
      }
    } else {
      return !this.isOpeningDayOfWeek(dt, dow);
    }
  }

  getRoadDistanceToMalls(origin: ILocation): Promise<IDistance[]> {
    return new Promise((resolve, reject) => {
      this.mall.find({}).then((malls: IMall[]) => {
        const destinations: ILocation[] = [];
        malls.map((m: IMall) => {
          const loc = {
            lat: m.lat,
            lng: m.lng,
            placeId: m.placeId,
            city: '',
            province: '',
            streetName: '',
            streetNumber: ''
          };
          destinations.push(loc);
        });

        this.distance.loadRoadDistances(origin, destinations).then((ds: IDistance[]) => {
          resolve(ds);
        });
      });
    });
  }


  // find with join
  jFind(query: any, options?: any): Promise<IRestaurant[]> {
    const self = this;
    return new Promise((resolve, reject) => {
      this.mall.find({}).then((malls: IMall[]) => {
        this.find(query, options).then(rs => {
          rs.map((r: any) => {
            r.mall = malls.find((m: IMall) => m._id.toString() === r.mallId.toString());
          });

          resolve(rs);
        });
      });
    });
  }

  // query { status: 'active' }
  loadByDeliveryInfo(origin: ILocation, dt: moment.Moment, query: any): Promise<any> {
    const dow: number = dt.day();
    return new Promise((resolve, reject) => {
      this.area.getNearestArea(origin).then((area: IArea) => {
        this.mall.getScheduledMallIds(area._id.toString(), dow).then((scheduledMallIds: any[]) => {
          this.getRoadDistanceToMalls(origin).then((ds: IDistance[]) => {
            this.range.find({ type: 'free', status: 'active' }).then((rs: any[]) => {
              this.jFind(query).then(ms => {
                ms.map((r: any) => {
                  const d = ds.find(x => x.destinationPlaceId === r.mall.placeId);
                  const scheduledMallId = scheduledMallIds.find((mId: any) => mId.toString() === r.mall._id.toString());
                  r.onSchedule = scheduledMallId ? true : false;
                  r.distance = d ? d.element.distance.value : 0;
                  r.inRange = r.mall ? true : false; // is it in orange circle ? fix me
                  r.orderEnded = this.isOrderEnded(dt, origin, area, r, rs);  // for free range
                  r.orderEndTime = this.getOrderEndTime(origin, area, r, rs); // for free range
                  r.isClosed = this.isClosed(dt, r.closed, r.dow);
                });
                resolve(ms);
              });
            });
          }, err => {
            reject();
          });
        });
      });
    });
  }

  // load restaurants
  // origin --- ILocation object
  // dateType --- string 'today', 'tomorrow'
  load(req: Request, res: Response) {
    const origin = req.body.origin;
    const dateType = req.body.dateType;
    const dt = dateType === 'today' ? moment() : moment().add(1, 'days');
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    this.loadByDeliveryInfo(origin, dt, query).then((rs: any) => {
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
}