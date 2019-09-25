import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Entity } from "../entity";
import moment from "moment-timezone";

export interface IMall {
  id?: any;
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
  mallId: string;
  mallName: string;
  areas: (string[])[];
  status: string;
  created?: Date;
  modified?: Date;
}

export class Mall extends Model {
  scheduleEntity: Entity;

  constructor(dbo: DB) {
    super(dbo, 'malls');
    this.scheduleEntity = new Entity(dbo, 'mall_schedules');
  }

  getAvailableMallIds(areaId: string, delivered: string): Promise<string[]>{
    return new Promise( (resolve, reject) => {
      this.scheduleEntity.find({status: 'active'}).then((mss: any[]) => {
        const dow = moment(delivered).day();
        const mallIds: string[] = [];
        mss.map((ms: IMallSchedule) => {
          const areaIds: string[] = ms.areas[dow];
          const id = areaIds.find(id => id === areaId);
          if(id){
            mallIds.push(ms.mallId);
          }
        });
        resolve(mallIds);
      }, err => {
        reject();
      });
    });
  }

  getAvailables(req: Request, res: Response) {
    const areaId = req.body.areaId;
    const delivered = req.body.delivered;

    this.getAvailableMallIds(areaId, delivered).then((mallIds: string[]) => {
      res.setHeader('Content-Type', 'application/json');
      if (!(mallIds && mallIds.length)) {
        res.end(JSON.stringify({ status: 'fail', mallIds: [] }, null, 3));
      } else {
        res.end(JSON.stringify({ status: 'success', mallIds: mallIds }, null, 3));
      }
    });
  }
}