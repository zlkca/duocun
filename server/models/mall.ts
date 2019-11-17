import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Entity } from "../entity";
import moment from "moment";
import { Area, IArea } from "./area";
import { MallSchedule } from "./mall-schedule";
import { ObjectID, Collection } from "mongodb";

export interface IMall {
  _id?: any;
  name?: string;
  description?: string;
  placeId: string;
  lat: number;
  lng: number;
  ranges?: string[];
  distance?: number; // Dynamic
  deliverFee?: number; // Dynamic
  fullDeliverFee?: number; // Dynamic
  created?: Date;
  modified?: Date;
}

export interface IMallSchedule{
  mallId?: string;
  mall?: IMall;
  areas: (string[])[];
  status: string;
  created?: Date;
  modified?: Date;
}

export class Mall extends Model {
  mallSchedule: MallSchedule;
  areaModel: Area;
  constructor(dbo: DB) {
    super(dbo, 'malls');
    this.mallSchedule = new MallSchedule(dbo);
    this.areaModel = new Area(dbo);
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

  getScheduledMallIds(areaId: string, dow: number): Promise<any[]>{
    return new Promise( (resolve, reject) => {
      this.mallSchedule.find({status: 'active'}).then(mss => {
        const mallIds: any[] = [];
        // const dow = moment(delivered).day();
        mss.map((ms: IMallSchedule) => {
          const areaIds: string[] = ms.areas[dow];
          const id = areaIds.find(id => id === areaId);
          if(id){
            mallIds.push(ms.mallId);
          }
        });
        resolve(mallIds);
      });

      // const params = [
      //   {$lookup: {from: 'malls', localField: 'mallId', foreignField: '_id', as: 'mall'}},
      //   {$unwind: '$mall'}
      // ];
  
      // this.mallSchedule.join(params, q).then((rs: any[]) => {
      //   const malls: any[] = [];
      //   const dow = moment(delivered).day();
      //   rs.map((ms: IMallSchedule) => {
      //     const areaIds: string[] = ms.areas[dow];
      //     const id = areaIds.find(id => id === areaId);
      //     if(id){
      //       malls.push(ms.mall);
      //     }
      //   });
      //   resolve(malls);
      // });
    });
  }

  getAvailableMallIds(req: Request, res: Response) {
    const origin = req.body.origin;
    const delivered = req.body.delivered;

    this.areaModel.getNearestArea(origin).then((area: IArea) => {
      const dow = moment(delivered).day();
      this.getScheduledMallIds(area.id.toString(), dow).then((mallIds: any[]) => {
        res.setHeader('Content-Type', 'application/json');
        if (!(mallIds && mallIds.length)) {
          res.end(JSON.stringify({ status: 'fail', mallIds: [] }, null, 3));
        } else {
          res.end(JSON.stringify({ status: 'success', mallIds: mallIds }, null, 3));
        }
      });
    });
  }
}