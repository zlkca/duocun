import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import { Mall, IMall } from "./mall";
import { Distance, ILocation, IDistance } from "./distance";
import { Area, ILatLng, IArea } from "./area";

import { Request, Response } from "express";

export class Restaurant extends Model {
  mall: Mall;
  distance: Distance;
  area: Area;

  constructor(dbo: DB) {
    super(dbo, 'restaurants');
    this.mall = new Mall(dbo);
    this.distance = new Distance(dbo);
    this.area = new Area(dbo);
  }

  load(origin: ILocation, delivered: string): Promise<any> {

    return new Promise((resolve, reject) => {

      this.area.getNearestArea(origin).then((a: IArea) => {
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
          this.mall.getAvailableMallIds(a.id.toString(), delivered).then((mallIds: string[]) => {
            const availableMalls = malls.filter(m => mallIds.find(id => id === m.id) ? true : false);

            this.distance.loadRoadDistances(origin, destinations).then((ds: IDistance[]) => {
              this.find({ status: 'active' }).then(rs => {
                rs.map((r: any) => {
                  const availableMall = availableMalls.find(m => m.id === r.mallId);
                  if (availableMall) {
                    const d = ds.find(x => x.destinationPlaceId === availableMall.placeId);
                    r.inRange = true;
                    r.distance = d ? d.element.distance.value : 0;
                  } else {
                    const mall = malls.find(m => m.id === r.mallId);
                    r.inRange = false;
                    if (mall) {
                      const d = ds.find(x => x.destinationPlaceId === mall.placeId);
                      r.distance = d ? d.element.distance.value : 0;
                    } else {
                      r.distance = 0;
                    }
                  }
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

    this.load(origin, delivered).then((rs: any) => {
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
}