import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "./db";
import { Entity } from "./entity";
import { Config } from "./config";
import { IncomingMessage } from "http";
import https from 'https';

export class Distance extends Entity{
  cfg: Config;
  constructor(dbo: DB) {
    super(dbo, 'distances');
    this.cfg = new Config();
  }

  get(req: Request, res: Response){
    const id = req.params.id;
    
    this.findOne({_id: new ObjectID(id)}).then((r: any) => {
      if(r){
        res.send(JSON.stringify(r, null, 3));
      }else{
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  reqRoadDistances(req: Request, res: Response) {
    let key = this.cfg.GOOGLE_DISTANCE_KEY;
    let origin = req.body.origins[0]; // should be only one location
    let sOrigin = `${origin.lat},${origin.lng}`;
    // let malls = req.body.destinations;
    let destinations: any[] = [];
    req.body.destinations.map((d: any) => {
      destinations.push(`${d.lat},${d.lng}`);
    });
    let sDestinations = destinations.join('|');

    let url = 'https://maps.googleapis.com/maps/api/distancematrix/json?region=ca&origins=' + sOrigin + '&destinations=' + sDestinations + '&key=' + key;

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
              // elements[i].id = malls[i].id;
              // elements[i].stuffs = malls[i].stuffs;
              // elements[i].name = malls[i].name;
              // elements[i].type = malls[i].type;
              // elements[i].origin = origin;
              // elements[i].destination = destinations[i];

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