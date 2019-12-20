import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Entity } from "../entity";
import moment from "moment";
import { Area, IArea } from "./area";
import { MallSchedule } from "./mall-schedule";
import { ObjectID, Collection, ObjectId } from "mongodb";
import { Distance, ILocation, IDistance, IPlace } from "./distance";


export interface IRspMall {
  _id: string;
  name: string;
  description: string;
  placeId: string;
  lat: number;
  lng: number;
  ranges?: string[];
  distance?: number; // Dynamic
  deliverFee?: number; // Dynamic
  fullDeliverFee?: number; // Dynamic
  created?: string;
  modified?: string;
}

export interface IDbMall {
  _id: ObjectId;
  name: string;
  description: string;
  placeId: string;
  lat: number;
  lng: number;
  ranges?: string[];
  distance?: number; // Dynamic
  deliverFee?: number; // Dynamic
  fullDeliverFee?: number; // Dynamic
  created?: string;
  modified?: string;
}

export interface IMall {
  _id?: any;
  name: string;
  address: string;
  placeId: string;
  lat: number;
  lng: number;
  ranges: string[];
  status: string;
  type: string;

  // optional
  freeRanges?: any[];   // in db
  opening?: any[];      // in db
  pickupTimes: any[];   // in db

  distance?: number;        // Dynamic
  deliverFee?: number;      // Dynamic
  fullDeliverFee?: number;  // Dynamic

  created?: string;
  modified?: string;
}

export interface IMallSchedule{
  mallId: string;
  status: string;
  areas: (string[])[];

  mall?: IMall;
  created?: string;
  modified?: string;
}

export class Mall extends Model {
  mallSchedule: MallSchedule;
  areaModel: Area;
  distanceModel: Distance;
  constructor(dbo: DB) {
    super(dbo, 'malls');
    this.mallSchedule = new MallSchedule(dbo);
    this.areaModel = new Area(dbo);
    this.distanceModel = new Distance(dbo);
  }

  // load(query: any, options?: any): Promise<any> {
  //   const self = this;
  //   if (query && query.hasOwnProperty('id')) {
  //     let body = query.id;
  //     if (body && body.hasOwnProperty('$in')) {
  //       let a = body['$in'];
  //       const arr: any[] = [];
  //       a.map((id: string) => {
  //         arr.push({ _id: new ObjectID(id) });
  //       });

  //       query = { $or: arr };
  //     } else if (typeof body === "string") {
  //       query['_id'] = new ObjectID(query.id);
  //       delete query['id'];
  //     }
  //   }

  //   return new Promise((resolve, reject) => {
  //     self.getCollection().then((c: Collection) => {
  //       c.find(query, options).toArray((err, docs) => {
  //         let s: any[] = [];
  //         if (docs && docs.length > 0) {
  //           docs.map((v, i) => {
  //             if (v && v._id) {
  //               v.id = v._id;
  //               // delete (v._id);
  //             }
  //             s.push(v);
  //           });
  //         }
  //         resolve(s);
  //       });
  //     });
  //   });
  // }

  getScheduledMallIds(areaId: string, dow: number): Promise<string[]>{
    return new Promise( (resolve, reject) => {
      this.mallSchedule.find({status: 'active'}).then(mss => {
        const mallIds: string[] = [];
        mss.map((ms: IMallSchedule) => {
          const areaIds: string[] = ms.areas[dow];
          const id = areaIds.find(id => id === areaId);
          if(id){
            mallIds.push(ms.mallId.toString());
          }
        });
        resolve(mallIds);
      });
    });
  }


  //------------------------------------------------------------------
  // origin cannot be null
  getRoadDistanceToMalls(origin: ILocation): Promise<IDistance[]> {
    return new Promise((resolve, reject) => {
      this.find({status: 'active'}).then((malls: IMall[]) => {
        const destinations: IPlace[] = [];
        malls.map((m: IMall) => {
          const p: IPlace = { placeId: m.placeId, lat: m.lat, lng: m.lng };
          destinations.push(p);
        });

        this.distanceModel.loadRoadDistances(origin, destinations).then((ds: IDistance[]) => {
          resolve(ds);
        });
      });
    });
  }
}