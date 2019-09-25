import { DB } from "../db";
import { Model } from "./model";

import { Request, Response } from "express";

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
  constructor(dbo: DB) {
		super(dbo, 'areas');
  }

  // ----------------------------------------------
  getDirectDistance(d1: ILatLng, d2: ILatLng) {
    const dLat = (d2.lat - d1.lat);
    const dLng = (d2.lng - d1.lng);
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }

  getNearestArea(origin: ILatLng): Promise<IArea>{
    return new Promise( (resolve, reject) => {
      this.find({}).then((areas: IArea[]) => {
        let selected: IArea = areas[0];
        let shortest = this.getDirectDistance(origin, selected);
        for (let i = 1; i < areas.length; i++) {
          const area = areas[i];
          const distance = this.getDirectDistance(origin, area);
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