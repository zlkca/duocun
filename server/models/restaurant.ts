import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import { Mall, IMall } from "./mall";
import { Distance, ILocation, IDistance } from "./distance";
import { Area, ILatLng, IArea } from "./area";
import { Range } from './range';

import { Request, Response } from "express";
import { ObjectID } from "mongodb";

// ------------- interface v2 ----------------
export interface IRestaurant {
  id: string;
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

    if(q && q._id){
      q._id = new ObjectID(q._id);
    }

    if(q && q.mallId){
      q.mallId = new ObjectID(q.mallId);
    }

    const params = [
      {$lookup: {from: 'malls', localField: 'mallId', foreignField: '_id', as: 'mall'}},
      {$unwind: '$mall'}
      // {from: 'restaurants', localField: 'merchantId', foreignField: '_id', as: 'merchant'}
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
  
  loadByDeliveryInfo(origin: ILocation, delivered: string): Promise<any> {

    return new Promise((resolve, reject) => {

      this.area.getNearestArea(origin).then((area: IArea) => {
        this.mall.find({}).then((malls: IMall[]) => {
          const destinations: ILocation[] = [];
          malls.map((m:IMall) => {
            m.id = m.id.toString();
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
          this.mall.getScheduledMalls(area._id.toString(), delivered).then((scheduledMalls: any[]) => {
            this.distance.loadRoadDistances(origin, destinations).then((ds: IDistance[]) => {
              const params = [
                {from: 'malls', localField: 'mallId', foreignField: '_id', as: 'mall'},
                // {from: 'restaurants', localField: 'merchantId', foreignField: '_id', as: 'merchant'}
              ];
                this.load({ status: 'active' }, params).then(rs => {
                  rs.map((r: any) => {
                    const d = ds.find(x => x.destinationPlaceId === r.mall.placeId);
                    const mall = scheduledMalls.find((m: any) => m._id.toString() === r.mall._id.toString());
                    r.onSchedule = mall? true: false;
                    r.distance = d ? d.element.distance.value : 0;
                    r.inRange = mall? true: false; // how? fix me
                  });
                  resolve(rs);
                });
            }, err => {
              reject();
            });
          });
        });
      });
    });
  }


  loadAll(req: Request, res: Response) {
    const origin = req.body.origin;
    const delivered = req.body.delivered;

    this.loadByDeliveryInfo(origin, delivered).then((rs: any) => {
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
}