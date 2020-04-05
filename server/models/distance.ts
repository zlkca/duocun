import { IncomingMessage } from "http";
import https from 'https';
import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import { Config } from "../config";

export interface ILatLng {
  lat: number;
  lng: number;
}

export interface IPlace {
  placeId: string;
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
  destination: IPlace;
  element: IDistanceElement;
}

export class Distance extends Model {
  cfg: Config;
  constructor(dbo: DB) {
    super(dbo, 'distances');
    this.cfg = new Config();
  }

  // ----------------------------------------------
  // return km
  getDirectDistance(d1: ILatLng, d2: ILatLng) {
    if (d1 && d2) {
      const lat1 = +d1.lat;
      const lng1 = +d1.lng;
      const lat2 = +d2.lat;
      const lng2 = +d2.lng;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLng = (lng2 - lng1) * (Math.PI / 180);

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(lat1 * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180))
        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const d = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return Math.round(d / 10) / 100;
    } else {
      return 0;
    }
  }

  // origin --- must include address fields for origin
  doReqRoadDistances(origin: ILocation, destinations: IPlace[]): Promise<IDistance[]> {
    const key = this.cfg.GOOGLE_DISTANCE_KEY;
    const ds: string[] = [];
    destinations.map((d: any) => {
      ds.push(`${d.lat},${d.lng}`);
    });
    const sDestinations = ds.join('|');

    const streetName = origin.streetName;
    const streetNumber = origin.streetNumber;
    const subLocality = origin.subLocality;
    const city = origin.city;
    const province = origin.province;

    const address = streetNumber.split(' ').join('+') + '+'
    + streetName.split(' ').join('+') + '+'
    + (subLocality ? subLocality : city).split(' ').join('+') + '+'
    + province;

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
              const distances: IDistance[] = [];
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
                resolve(distances);
              } else {
                resolve([]); // no distance
              }
            } else {
              resolve([]); // no data
            }
          });
        });
    });
  }

  dbHasAllPlaceIds(destIds: string[], dbDestIds: string[]) {
    let bFound = true;

    if (destIds.length === 0 || dbDestIds.length === 0) {
      return false;
    }

    destIds.map(d => {
      const _id = dbDestIds.find(id => id === d);
      if (!_id) {
        bFound = false;
        return false;
      }
    });
    return bFound;
  }

  // origin --- must include address fields for origin, cannot be null, will have compile issue
  loadRoadDistances(origin: ILocation, destinations: IPlace[]): Promise<IDistance[]> {
    const destIds: string[] = destinations.map(d => d.placeId);
    return new Promise((resolve, reject) => {
      if (!origin || destinations.length === 0) {
        resolve([]);
      } else {
        this.find({ originPlaceId: origin.placeId }).then((ds: IDistance[]) => {
          const dbDestIds: string[] = ds.map(d => d.destinationPlaceId);

          if (this.dbHasAllPlaceIds(destIds, dbDestIds)) {
            resolve(ds);
          } else {
            this.doReqRoadDistances(origin, destinations).then((rds: IDistance[]) => {
              const distances: IDistance[] = [];
              rds.map((rd: IDistance) => {
                if (dbDestIds.indexOf(rd.destinationPlaceId) === -1) {
                  distances.push(rd);
                }
              });

              if (distances && distances.length > 0) {
                this.insertMany(distances).then(ds3 => {
                  if (ds3 && ds3.length > 0) {
                    resolve(ds.concat(ds3)); // ds + ds3
                  } else {
                    resolve(ds); // ds
                  }
                });
              } else {
                resolve(ds);
              }
            });
          }
        });
      }
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