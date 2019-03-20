import { Request, Response } from "express";
import https from 'https';
import crypto from 'crypto';
import fs from "fs";
import { IncomingMessage } from "http";

export class Utils {
  cfg: any;

  constructor(
  ) {
    this.cfg = JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
  }

  genWechatToken(req: Request, res: Response) {
    let token = 'testToken20';
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;
    let signature = req.query.signature;
    let echostr = req.query.echostr;
    let list = [token, timestamp, nonce].sort();
    let sha1 = crypto.createHash('sha1');
    let s = list.join('');
    let hash = sha1.update(s).digest('hex');
    console.log(hash);
    if (hash === signature) {
      res.send(echostr);
    } else {
      res.send('');
    }
  }

  getGeocode(req: Request, res: Response) {
    let key = this.cfg.GEOCODE.KEY;
    let latlng = req.query.lat + ',' + req.query.lng;
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&key=' + key + '&latlng=' + latlng;
    https.get(url, (res1: IncomingMessage) => {
      let data = '';
      res1.on('data', (d) => {
        // process.stdout.write(d);
        data += d;
      });

      res1.on('end', () => {
        if (data) {
          const s = JSON.parse(data);
          if (s.results && s.results.length > 0) {
            res.send(s.results[0]);
          } else {
            res.send();
          }
        } else {
          res.send('');
        }
      });
    });
  }
}