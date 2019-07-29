import { DB } from "../db";
import { Model } from "./model";
import { IncomingMessage } from "http";
import https from 'https';
import { Request, Response } from "express";
import { Config } from "../config";

export class Location extends Model {
  cfg: Config;
  constructor(dbo: DB) {
    super(dbo, 'locations');
    this.cfg = new Config();
  }

  reqPlaces(req: Request, res: Response) {
    let key = this.cfg.GOOGLE_PLACE_KEY;
    // let input = req.query.input;
    const input = req.params.input;

    let url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + input + '&key=' + key
      + '&location=43.761539,-79.411079&radius=100'; // only for GTA

    https.get(url, (res1: IncomingMessage) => {
      let data = '';
      res1.on('data', (d) => {
        data += d;
      });

      res1.on('end', (rr: any) => {
        // console.log('receiving done!');
        if (data) {
          const s = JSON.parse(data);
          if (s.predictions && s.predictions.length > 0) {
            res.send(s.predictions);
          } else {
            res.send();
          }
        } else {
          res.send('');
        }
      });
    });
  }


  reqGeocodes(req: Request, res: Response) {
    let key = this.cfg.GEOCODE_KEY;
    // const latlng = (req.query.lat && req.query.lng) ? (req.query.lat + ',' + req.query.lng) : '';
    const addr = req.params.address;
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&key=' + key;
    // if (latlng) {
    //   url += '&latlng=' + latlng;
    // } else if (addr) {
    //   url += '&address=' + addr;
    // }
    
    url += '&address=' + addr;

    https.get(url, (res1: IncomingMessage) => {
      let data = '';
      res1.on('data', (d) => {
        // process.stdout.write(d);
        data += d;
        // console.log('receiving: ' + d);
      });

      res1.on('end', () => {
        // console.log('receiving done!');
        if (data) {
          const s = JSON.parse(data);
          if (s.results && s.results.length > 0) {
            res.send(s.results);
          } else {
            res.send([]);
          }
        } else {
          res.send([]);
        }
      });
    });
  }
}