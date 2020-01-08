import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import { Mall, IMall, IDbMall } from "./mall";
import { Distance, ILocation, IDistance, IPlace } from "./distance";
import { Area, ILatLng, IArea } from "./area";
import { Range, IRange } from './range';

import { Request, Response } from "express";
import { ObjectID, Collection, ObjectId } from "mongodb";
import moment from "moment";
import { resolve } from "path";
import { IAccount } from "./account";

// ------------- interface v2 ----------------
export interface IPhase {
  orderEnd: string; // hh:mm
  pickup: string; // hh:mm
}

export interface IMerchant {
  _id: string;
  name: string;
  description: string;
  // location: ILatLng; // lat lng
  accountId: string;
  mallId: string;
  address: string;
  closed: string[];
  dow: string;          // day of week opening, eg. '1,2,3,4,5'
  pictures: string[];
  phases: IPhase[];
  created: string;
  modified: string;

  // optional field
  account?: IAccount;
  mall?: IMall;
  distance?: number;
  inRange?: boolean;
  orderEnded?: boolean;
  orderEndTime?: string;
  isClosed?: boolean;

  order?: number;
  startTime?: string;
  endTime?: string;
  onSchedule?: boolean;
}

export interface IDbMerchant {
  _id: ObjectId;
  name: string;
  nameEN: string;
  description: string;
  accountId: ObjectId;
  mallId: ObjectId;
  pictures: any[];
  closed: string[];
  dow: string;           // day of week opening, eg. '1,2,3,4,5'
  created: string;
  modified: string;

  mall?: IDbMall;

  location: ILatLng;      // lat lng
  malls: string[];        // mall id
  address: string;
  order?: number;
  startTime?: string;
  endTime?: string;
  // inRange: boolean;
  onSchedule: boolean;
  phases: IPhase[];
}

export class Merchant extends Model {
  mallModel: Mall;
  distance: Distance;
  area: Area;
  range: Range;

  constructor(dbo: DB) {
    super(dbo, 'merchants');
    this.mallModel = new Mall(dbo);
    this.distance = new Distance(dbo);
    this.area = new Area(dbo);
    this.range = new Range(dbo);
  }

  list(req: Request, res: Response) {
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    query = this.convertIdFields(query);

    this.joinFind(query).then((ms: IDbMerchant[]) => {
      const rs: IMerchant[] = [];
      ms.map(m => {
        rs.push(this.toBasicRspObject(m));
      });

      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  // only central area has late order end time in it's last phase
  isOrderEnded(t: moment.Moment, deliveryDate: moment.Moment, area: IArea, phases: IPhase[]) {
    const last = area.code === 'C' ? phases[phases.length - 1].orderEnd : phases[0].orderEnd;
    const first = phases[0].orderEnd;
    if (t.isAfter(this.getTime(deliveryDate, last))) {
      return true;
    } else {
      if (t.isAfter(this.getTime(deliveryDate, first))) {
        if (area.code === 'C') {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

  // Then Order End Time display on client merchant list
  getOrderEndTime(phases: IPhase[], area?: IArea) {
    if (area) {
      const last = area.code === 'C' ? phases[phases.length - 1].orderEnd : phases[0].orderEnd;
      const first = phases[0].orderEnd;
      if (area.code === 'C') {
        return last;
      } else {
        return first;
      }
    } else {
      return '';
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
  // s --- must be '2019-10-22' or '2019-11-03T13:52:59.566Z' format
  getDateString(s: string) {
    if(typeof s === 'string'){
      if (s.indexOf('T') !== -1) {
        return s.split('T')[0];
      } else {
        return s;
      }
    }else{
      console.log('getDateString error input :' + s);
      return s;
    }
  }

  // ------------------------------------------------------------------------------
  // specialClosingDates --- array of string, eg. ['2019-10-22', ...]
  // dow ---- string '0,1,2,3,4,5,6'
  // dt --- moment object
  isClosed(dt: moment.Moment, specialClosingDates: string[], dow: string) {
    if (specialClosingDates) { // has special close day
      if (specialClosingDates.find(d => moment(this.getDateString(d), 'YYYY-MM-DD').isSame(dt, 'day'))) {
        return true;
      } else {
        return !this.isOpeningDayOfWeek(dt, dow);
      }
    } else {
      return !this.isOpeningDayOfWeek(dt, dow);
    }
  }

  joinFind(query: any, options?: any): Promise<IDbMerchant[]> {
    return new Promise((resolve, reject) => {
      this.mallModel.find({}).then((malls: IDbMall[]) => {

        this.find(query, options).then((rs: IDbMerchant[]) => {
          rs.map((r: IDbMerchant) => {
            r.mall = malls.find((m: IDbMall) => m && r.mallId && m._id.toString() === r.mallId.toString());
          });

          resolve(rs);
        });
      });
    });
  }

  toBasicRspObject(r: IDbMerchant) {
    const mall: any = r.mall;

    const m: IMall = {
      _id: mall._id.toString(),
      name: mall.name,
      address: mall.address,
      placeId: mall.placeId,
      lat: mall.lat,
      lng: mall.lng,
      ranges: mall.ranges,
      status: mall.status,
      type: mall.type,
      pickupTimes: mall.pickupTimes
    }

    const merchant: IMerchant = {
      _id: r._id.toString(),
      name: r.name,
      description: r.description,
      accountId: r.accountId.toString(),
      mallId: r.mallId.toString(),
      address: r.address,
      closed: r.closed,
      dow: r.dow,
      mall: m,
      phases: r.phases,
      pictures: r.pictures,
      created: r.created,
      modified: r.modified,

      inRange: r.mall ? true : false, // is it in orange circle ? fix me

    }
    return merchant;
  }

  // query { status: 'active' }
  loadByDeliveryInfo(query: any, origin?: ILocation, utcDate?: moment.Moment): Promise<IMerchant[]> {

    return new Promise((resolve, reject) => {
      if (origin) {
        this.area.getNearestArea(origin).then((area: IArea) => {
          const datetime = utcDate ? utcDate : moment.utc();
          const dow: number = utcDate ? utcDate.local().day() : moment.utc().local().day();
          this.mallModel.getScheduledMallIds(area._id.toString(), dow).then((scheduledMallIds: any[]) => {
            this.mallModel.getRoadDistanceToMalls(origin).then((ds: IDistance[]) => {
              this.joinFind(query).then((ms: IDbMerchant[]) => {

                const merchants: IMerchant[] = [];

                ms.map((r: IDbMerchant) => {
                  const mall: any = r.mall;
                  const d = ds.find(x => x.destinationPlaceId === mall.placeId);
                  const scheduledMallId = scheduledMallIds.find((mId: any) => mId.toString() === mall._id.toString());
                  const merchant = this.toBasicRspObject(r);

                  merchant.onSchedule = scheduledMallId ? true : false;
                  merchant.distance = d ? d.element.distance.value : 0;
                  merchant.orderEnded = this.isOrderEnded(moment(), datetime, area, r.phases);
                  merchant.orderEndTime = this.getOrderEndTime(r.phases, area);
                  merchant.isClosed = this.isClosed(datetime, r.closed, r.dow);
                  merchants.push(merchant);
                });
                resolve(merchants);
              });
            }, err => {
              reject();
            });
          });
        });
      } else {
        this.joinFind(query).then((ms: IDbMerchant[]) => {

          const merchants: IMerchant[] = [];

          ms.map((r: IDbMerchant) => {
            const merchant = this.toBasicRspObject(r);

            merchant.onSchedule = true;
            merchant.distance = 0;
            merchant.orderEnded = false;
            merchant.orderEndTime = this.getOrderEndTime(r.phases),
              merchant.isClosed = false;

            merchants.push(merchant);
          });
          resolve(merchants);
        });
      }
    });
  }

  // load restaurants
  // origin --- ILocation object
  // dateType --- string 'today', 'tomorrow'
  load(req: Request, res: Response) {
    const origin = req.body.origin;
    const dateType = req.body.dateType;
    const dt = dateType === 'today' ? moment.utc() : moment.utc().add(1, 'days');
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    this.loadByDeliveryInfo(query, origin, dt).then((rs: any) => {
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
}