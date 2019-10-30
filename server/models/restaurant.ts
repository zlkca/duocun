import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import { Mall, IMall } from "./mall";
import { Distance, ILocation, IDistance } from "./distance";
import { Area, ILatLng, IArea } from "./area";
import { Range, IRange } from './range';

import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import moment from "moment";

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

  isOrderEnded(origin: ILocation, r: IRestaurant, rs: IRange[]){
    const last = r.phases[ r.phases.length - 1 ].orderEnd;
    const first = r.phases[0].orderEnd;
    if(moment().isAfter(this.getTime(moment(), last))){
      return true;
    } else { 
      if(moment().isAfter(this.getTime(moment(), first))) {
        if(this.range.inRange(origin, rs)){
          return false;
        }else{
          return true;
        }
      }else{
        return false;
      }
    }
  }


  loadByDeliveryInfo(origin: ILocation, dow: number): Promise<any> {

    return new Promise((resolve, reject) => {
      this.area.getNearestArea(origin).then((area: IArea) => {
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

          this.mall.getScheduledMallIds(area._id.toString(), dow).then((scheduledMallIds: any[]) => {
            this.distance.loadRoadDistances(origin, destinations).then((ds: IDistance[]) => {
              this.range.find({ type: 'free', status: 'active' }).then((rs: any[]) => {
                this.find({ status: 'active' }).then(ms => {
                  ms.map((r: any) => {
                    const mall: any = malls.find((m: any) => m._id.toString() === r.mallId.toString())
                    const d = ds.find(x => x.destinationPlaceId === mall.placeId);
                    const scheduledMallId = scheduledMallIds.find((mId: any) => mId.toString() === mall._id.toString());
                    r.onSchedule = scheduledMallId ? true : false;
                    r.distance = d ? d.element.distance.value : 0;
                    r.inRange = mall ? true : false; // how? fix me
                    r.orderEnded = this.isOrderEnded(origin, r, rs);
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
    });
  }


  // load all restaurants
  // origin --- ILocation object
  // deliverDate --- string 'today', 'tomorrow'
  loadAll(req: Request, res: Response) {
    const origin = req.body.origin;
    const deliverDate = req.body.deliverDate;
    const dow = deliverDate === 'today' ? moment().day() : moment().add(1, 'days').day();

    this.loadByDeliveryInfo(origin, dow).then((rs: any) => {
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
}