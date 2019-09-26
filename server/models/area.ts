import { DB } from "../db";
import { Model } from "./model";

import { Request, Response } from "express";
import { Distance } from "./distance";

export interface ILatLng {
  lat: number;
  lng: number;
}

export interface IArea {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
}

export class Area extends Model{
  distanceModel: Distance;
  constructor(dbo: DB) {
    super(dbo, 'areas');
    this.distanceModel = new Distance(dbo);
  }

  getNearestArea(origin: ILatLng): Promise<IArea>{
    return new Promise( (resolve, reject) => {
      this.find({}).then((areas: IArea[]) => {
        let selected: IArea = areas[0];
        let shortest = this.distanceModel.getDirectDistance(origin, selected);
        for (let i = 1; i < areas.length; i++) {
          const area = areas[i];
          const distance = this.distanceModel.getDirectDistance(origin, area);
          if (shortest > distance) {
            selected = area;
            shortest = distance;
          }
        }
        resolve(selected);
      }, err => {
        reject();
      });
    });
  }

  getNearest(req: Request, res: Response) {
    const origin = req.body.origin;

    this.getNearestArea(origin).then((area: IArea) => {
      res.setHeader('Content-Type', 'application/json');
      if (!area) {
        res.end(JSON.stringify({ status: 'fail', area: '' }, null, 3));
      } else {
        res.end(JSON.stringify({ status: 'success', area: area }, null, 3));
      }
    });
  }

}