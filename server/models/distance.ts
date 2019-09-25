import { IncomingMessage } from "http";
import https from 'https';
import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import { Config } from "../config";
import { resolve } from "dns";

export interface ILatLng {
  lat: number;
  lng: number;
}

export interface ILocation {
  placeId: string;
  lat: number;
  lng: number;
  city: string;
  province: string;
  streetName: string;
  streetNumber: string;
  subLocality?: string;
  postalCode?: string;
}

export interface IPair {
  value: number;
  text: string;
}

export interface IDistanceElement {
  status?: string;
  duration: IPair;
  distance: IPair;
}

export interface IDistance {
  originPlaceId: string;
  destinationPlaceId: string;
  origin: ILocation;
  destination: ILocation;
  element: IDistanceElement;
}

export class Distance extends Model {
  cfg: Config;
  constructor(dbo: DB) {
    super(dbo, 'distances');
    this.cfg = new Config();
  }

  doReqRoadDistances(origin: ILocation, destinations: ILocation[]): Promise<ILocation[]> {
    const key = this.cfg.GOOGLE_DISTANCE_KEY;
    const ds: string[] = [];
    destinations.map((d: any) => {
      ds.push(`${d.lat},${d.lng}`);
    });
    const sDestinations = ds.join('|');
    const address = origin.streetNumber.split(' ').join('+') + '+'
      + origin.streetName.split(' ').join('+') + '+'
      + (origin.subLocality ? origin.subLocality : origin.city).split(' ').join('+') + '+'
      + origin.province;
    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json?&region=ca&origins='
      + address + '&destinations=' + sDestinations + '&key=' + key;

    return new Promise((resolve, reject) => {
      https.get(url, (res1: IncomingMessage) => {
        let data = '';
        res1.on('data', (d) => { data += d; });
        res1.on('end', (rr: any) => {
          if (data) {
            const s = JSON.parse(data);
            const rows = s.rows;
            const distances: any[] = [];
            if (rows && rows.length > 0 && rows[0].elements && rows[0].elements.length > 0) {
              for (let i = 0; i < destinations.length; i++) {
                const destination = destinations[i];

                distances.push({
                  originPlaceId: origin.placeId,
                  destinationPlaceId: destination.placeId,
                  origin: origin,
                  destination: destination, // destination is mall
                  element: rows[0].elements[i],
                });
              }

              this.deleteMany({ originPlaceId: origin.placeId }).then(() => {
                this.insertMany(distances).then(() => {
                  resolve(distances);
                });
              });
            } else {
              resolve(); // no distance
            }
          } else {
            resolve(); // no data
          }
        });
      });
    });
  }

  checkRoadDistances(originPlaceId: string, destinations: ILocation[]): Promise<IDistance[]> {
    const q = { originPlaceId: originPlaceId }; // origin --- client origin
    const d1 = destinations.map(d => d.placeId);

    return new Promise((resolve, reject) => {
      this.find(q).then((ds: IDistance[]) => {
        const d2 = ds.map(d => d.destinationPlaceId);
        if (d1.sort().join(',') === d2.sort().join(',')) {
          resolve(ds);
        } else {
          resolve([]);
        }
      });
    });
  }

  loadRoadDistances(origin: ILocation, destinations: ILocation[]): Promise<IDistance[]> {
    return new Promise((resolve, reject) => {
      this.checkRoadDistances(origin.placeId, destinations).then(ds => {
        if (ds && ds.length > 0) {
          resolve(ds);
        } else {
          this.doReqRoadDistances(origin, destinations).then(ds2 => {
            if (ds2) {
              this.deleteMany([{ originPlaceId: origin.placeId }]).then((y: any) => {
                this.insertMany(ds2).then(ds3 => {
                  if(ds3 && ds3.length>0){
                    resolve(ds3);
                  }else{
                    resolve([]);
                  }
                });
              });
            } else {
              // should not happen
              resolve([]);
            }
          });
        }
      });
    });
  }

  // input --- {origin:{lat, lng, placeId}, destination: {lat, lng, placeId}}
  reqRoadDistances(req: Request, res: Response) {
    const origin: ILocation = req.body.origins[0]; // should be only one location
    const destinations: ILocation[] = req.body.destinations;

    this.loadRoadDistances(origin, destinations).then(ds => {
      res.send(ds);
    });
  }
}