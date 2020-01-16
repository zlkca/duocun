import { DB } from "../db";
import { Model } from "./model";

import { Request, Response } from "express";
import { Distance } from "./distance";
import { resolve } from "url";

export interface ILatLng {
  lat: number;
  lng: number;
}

export interface IArea {
  _id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  coords?: ILatLng[];
  distance?: number; // km
  rate?: number;
}

export class Area extends Model {
  distanceModel: Distance;
  constructor(dbo: DB) {
    super(dbo, 'areas');
    this.distanceModel = new Distance(dbo);
  }

  // except downtown
  getNearestArea(origin: ILatLng): Promise<IArea> {
    return new Promise((resolve, reject) => {
      this.find({ status: 'active' }).then((areas: IArea[]) => {
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
        resolve();
      });
    });
  }

  getArea(origin: ILatLng): Promise<IArea> {
    return new Promise((resolve, reject) => {
      this.findOne({ code: 'DT' }).then((area: IArea) => {
        const coords: any = area.coords;
        if(this.inPolygon(origin, coords)){
          resolve(area);
        }else{
          this.getNearestArea(origin).then(area => {
            resolve(area);
          });
        }
      });
    });
  }

  inDowntownArea(origin: ILatLng): Promise<IArea> {
    return new Promise((resolve, reject) => {
      this.findOne({ code: 'DT' }).then((area: IArea) => {
        const coords: any = area.coords;
        if(this.inPolygon(origin, coords)){
          resolve(area);
        }else{
          resolve();
        }
      });
    });
  }


  inPolygon(point: ILatLng, vs: ILatLng[]) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    const x = point.lat, y = point.lng;

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      let xi = vs[i].lat, yi = vs[i].lng;
      let xj = vs[j].lat, yj = vs[j].lng;

      let intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };


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