import { Request, Response } from "express";
import https from 'https';
import crypto from 'crypto';
import { IncomingMessage } from "http";
import { Config } from "./config";

export class Utils {
  cfg: any;

  constructor() {
    this.cfg = new Config();// JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
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
    // console.log(hash);
    if (hash === signature) {
      res.send(echostr);
    } else {
      res.send('');
    }
  }
  
  getWechatAccessToken(authCode: string): Promise<any> {
    const APP_ID = this.cfg.WECHAT.APP_ID;
    const SECRET = this.cfg.WECHAT.APP_SECRET;
    let url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + APP_ID +
      '&secret=' + SECRET + '&code=' + authCode + '&grant_type=authorization_code';

    return new Promise((resolve, reject) => {
      https.get(url, (res1: IncomingMessage) => {
        let data = '';
        res1.on('data', (d) => {
          data += d;
        });
  
        res1.on('end', () => {
          // console.log('receiving done!');
          if (data) {
            const s = JSON.parse(data);
            if (s && s.access_token) {
              resolve(s);
            } else {
              reject();
            }
          } else {
            reject();
          }
        });

      });
    });
  }

  refreshWechatAccessToken(oldRefreshToken: string): Promise<any>{
    const APP_ID = this.cfg.WECHAT.APP_ID;
    let url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' + APP_ID +
      '&grant_type=refresh_token&refresh_token=' + oldRefreshToken;

    return new Promise((resolve, reject) => {
      https.get(url, (res1: IncomingMessage) => {
        let data = '';
        res1.on('data', (d) => {
          data += d;
        });

        res1.on('end', () => {
          // console.log('receiving done!');
          if (data) {
            const s = JSON.parse(data);
            if (s.refresh_token) {
              resolve(s);
            } else {
              reject();
            }
          } else {
            reject();
          }
        });
      });
    });
  }

  //   return {   
  //     "openid":" OPENID",
  //     " nickname": NICKNAME,
  //     "sex":"1",
  //     "province":"PROVINCE"
  //     "city":"CITY",
  //     "country":"COUNTRY",
  //     "headimgurl":"http://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
  //     "privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
  //     "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
  // }
  getWechatUserInfo(accessToken: string, openId: string): Promise<any> {
    let url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + accessToken + '&openid=' + openId + '&lang=zh_CN';

    return new Promise((resolve, reject) => {
      https.get(url, (res1: IncomingMessage) => {
        let data = '';
        res1.on('data', (d) => {
          data += d;
        });

        res1.on('end', () => {
          // console.log('receiving done!');
          if (data) {
            const s = JSON.parse(data);
            if (s && s.openid) {
              resolve(s);
            } else {
              reject();
            }
          } else {
            reject();
          }
        });
      });
    });
  }

  getGeocodeLocationList(req: Request, res: Response) {
    let key = this.cfg.GEOCODE_KEY;
    const latlng = (req.query.lat && req.query.lng) ? (req.query.lat + ',' + req.query.lng) : '';
    const addr = req.query.address;
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&key=' + key;
    if (latlng) {
      url += '&latlng=' + latlng;
    } else if (addr) {
      url += '&address=' + addr;
    }
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

  getPlaces(req: Request, res: Response) {
    let key = this.cfg.GOOGLE_PLACE_KEY;
    // let location = req.query.lat + ',' + req.query.lng;
    let input = req.query.input;
    let url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + input + '&key=' + key
      + '&location=43.761539,-79.411079&radius=100';
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

  

  getAddrStringByPlace(place: any) {
    const terms = place.terms;
    if (terms && terms.length >= 4) {
      return terms[0].value + ' ' + terms[1].value + ', ' + terms[2].value + ', ' + terms[3].value + ', ' + terms[4].value;
    } else {
      return '';
    }
  }
}