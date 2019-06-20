import { IncomingMessage } from "http";
import https from 'https';
import { Request, Response } from "express";
import { DB } from "../db";
import { Model } from "./model";
import { Config } from "../config";

export class Distance extends Model{
  cfg: Config;
  constructor(dbo: DB) {
    super(dbo, 'distances');
    this.cfg = new Config();
  }

  // input --- {origin:{lat, lng, placeId}, destination: {lat, lng, placeId}}
  reqRoadDistances(req: Request, res: Response) {
    let key = this.cfg.GOOGLE_DISTANCE_KEY;
    let origin = req.body.origins[0]; // should be only one location
    const destinations: any[] = [];
    req.body.destinations.map((d: any) => {
      destinations.push(`${d.lat},${d.lng}`);
    });
    let sDestinations = destinations.join('|');

    let url = 'https://maps.googleapis.com/maps/api/distancematrix/json?&region=ca&origins=' + origin.address + '&destinations=' + sDestinations + '&key=' + key;
    // let url = 'https://maps.googleapis.com/maps/api/directions/json?mode=driving&units=metric&region=ca&origin=' + sOrigin + '&destination=' + sDestination + '&key=' + key;
    
    https.get(url, (res1: IncomingMessage) => {
      let data = '';
      res1.on('data', (d) => {
        // process.stdout.write(d);
        data += d;
        // console.log('receiving: ' + d);
      });

      res1.on('end', (rr: any) => {
        // console.log('receiving done!');
        if (data) {
          const s = JSON.parse(data);
          const rows = s.rows;
          const distances = [];
          if (rows && rows.length > 0 && rows[0].elements && rows[0].elements.length > 0) {
            // const elements = rows[0].elements;
            for (let i = 0; i < destinations.length; i++) {

              const destination = req.body.destinations[i];

              distances.push({
                originPlaceId: origin.placeId,
                destinationPlaceId: destination.placeId, 
                origin: origin,
                destination: destination, // destination is mall
                element: rows[0].elements[i],
                // mall: malls[i]
              });
            }
            res.send(distances);

            this.insertMany(distances).then(() => {
              console.log('distances inserted');
            });

          } else {
            res.send('');
          }
        } else {
          res.send('');
        }
      });
    });
  }
}