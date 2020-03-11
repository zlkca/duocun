import { DB } from "../db";
import { Model } from "./model";
import { IncomingMessage } from "http";
import https from 'https';
import { Request, Response } from "express";
import { Config } from "../config";
import { resolve } from "url";

// export interface GeoPoint  {
//   lat?: number;
//   lng?: number;
//   type?: string;
//   coordinates?: number[];
// }

// export interface IAddress {
//   formattedAddress?: string;
//   unit?: number;
//   streetName?: string;
//   streetNumber?: string;
//   location?: GeoPoint;
//   sublocality?: string;
//   city?: string;
//   province?: string;
//   country?: string;
//   postalCode?: string;
//   created?: Date;
//   modified?: Date;
//   id?: number;
// }


export interface IGooglePlace {
  id?: string;
  description?: string;
  place_id: string;
  reference: string;
  type?: string;
  structured_formatting: IStructuredAddress;
  terms?: IPlaceTerm[];
  types?: string[];
}

// use for front-end address list
export interface IAddress{
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface ILocation {
  placeId: string;
  lat: number;
  lng: number;
  unit?: string;
  streetName: string;
  streetNumber: string;
  subLocality: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}

export interface IPlaceTerm {
  offset: number;
  value: string;
}

export interface IStructuredAddress {
  main_text: string;
  secondary_text: string;
}

export interface IPlace {
  _id?: string;
  type?: string;
  description?: string;
  placeId?: string;
  structured_formatting: IStructuredAddress;
  terms?: IPlaceTerm[];
  location?: ILocation;
}

export class Location extends Model {
  cfg: Config;
  constructor(dbo: DB) {
    super(dbo, 'locations');
    this.cfg = new Config();
  }

  reqPlaces(req: Request, res: Response) {
    const keyword = req.params.input;
    this.getSuggestPlaces(keyword).then((rs: IGooglePlace[]) => {
      res.send(rs);
    });
  }

  getSuggestPlaces(keyword: string): Promise<IGooglePlace[]> {
    let key = this.cfg.GOOGLE_PLACE_KEY;
    let url = encodeURI('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + keyword + '&key=' + key
      + '&location=43.761539,-79.411079&radius=100'); // only for GTA

    return new Promise((resolve, reject) => {
      https.get(url, (res: IncomingMessage) => {
        let data = '';
        res.on('data', (d) => {
          data += d;
        });
  
        res.on('end', (rr: any) => {
          if (data) {
            const s = JSON.parse(data);
            if (s.predictions && s.predictions.length > 0) {
              resolve(s.predictions)
            } else {
              resolve([]);
            }
          } else {
            resolve([]);
          }
        });
      });
    });
  }

  googlePlacesToAddressList(ps: IGooglePlace[]) {
    const options: IAddress[] = [];
    if (!ps || ps.length === 0) {
      return options;
    } else {
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        const addr: IAddress = {
          placeId: p.place_id,
          mainText: p.structured_formatting.main_text,
          secondaryText: p.structured_formatting.secondary_text
        };
        options.push(addr);
      }
      return options;
    }
  }

  reqSuggestAddressList(req: Request, res: Response) {
    const keyword = req.params.keyword;
    this.getSuggestPlaces(keyword).then((rs: IGooglePlace[]) => {
      const addrs: IAddress[] = this.googlePlacesToAddressList(rs);
      res.send(addrs);
    });
  }

  getHistoryLocations(query: any, fields: string[]): Promise<ILocation[]>{
    return new Promise((resolve, reject) => {
      this.find(query).then((xs: ILocation[]) => {
        if (fields && fields.length > 0) {
          const rs: any[] = xs.map((x: any) => {
            const it: any = {};
            fields.map((key: any) => {
              it[key] = x[key];
            });
            return it;
          });
          resolve(rs);
        } else {
          resolve(xs);
        }
      });
    });
  }

  reqHistoryAddressList(req: Request, res: Response) {
    let query = {};
    let key = null;
    let fields: any = null;
    if (req.headers) {
      if (req.headers.filter && typeof req.headers.filter === 'string') {
        query = req.headers.filter ? JSON.parse(req.headers.filter) : null;
      }

      if (req.headers.fields && typeof req.headers.fields === 'string') {
        fields = JSON.parse(req.headers.fields);
      }
    }
  
    this.getHistoryLocations(query, fields).then((rs: ILocation[]) => {
      const addrs: IAddress[] = this.locationsToAddressList(rs);
      res.send(addrs);
    });
  }

  locationsToAddressList(items: any[]) {
    const options: IAddress[] = [];
    if (!items || items.length === 0) {
      return options;
    } else {
      for (let i = items.length - 1; i >= 0; i--) {
        const loc = items[i].location;
        const addr: IAddress = {
          placeId: loc.placeId,
          mainText: loc.streetNumber + ' ' + loc.streetName,
          secondaryText: (loc.subLocality ? loc.subLocality : loc.city) + ',' + loc.province
        };
        options.push(addr);
      }
      return options;
    }
  }

  // getLocationFromGeocode(geocodeResult): ILocation {
  //   const addr = geocodeResult && geocodeResult.address_components;
  //   const oLocation = geocodeResult.geometry.location;
  //   if (addr && addr.length) {
  //     const loc: ILocation = {
  //       placeId: geocodeResult.place_id,
  //       streetNumber: '',
  //       streetName: '',
  //       subLocality: '',
  //       city: '',
  //       province: '',
  //       postalCode: '',
  //       lat: typeof oLocation.lat === 'function' ? oLocation.lat() : oLocation.lat,
  //       lng: typeof oLocation.lng === 'function' ? oLocation.lng() : oLocation.lng
  //     };

  //     addr.forEach(compo => {
  //       if (compo.types.indexOf('street_number') !== -1) {
  //         loc.streetNumber = compo.short_name;
  //       }
  //       if (compo.types.indexOf('route') !== -1) {
  //         loc.streetName = compo.short_name;
  //       }
  //       if (compo.types.indexOf('postal_code') !== -1) {
  //         loc.postalCode = compo.short_name;
  //       }
  //       if (compo.types.indexOf('sublocality_level_1') !== -1 && compo.types.indexOf('sublocality') !== -1) {
  //         loc.subLocality = compo.short_name;
  //       }
  //       if (compo.types.indexOf('locality') !== -1) {
  //         loc.city = compo.short_name;
  //       }
  //       if (compo.types.indexOf('administrative_area_level_1') !== -1) {
  //         loc.province = compo.short_name;
  //       }
  //     });
  //     return loc;
  //   } else {
  //     return null;
  //   }
  // }

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

    https.get(encodeURI(url), (res1: IncomingMessage) => {
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


  // tools
  updateLocations(req: Request, res: Response) {
    this.find({}).then(locations => {
      const datas: any[] = [];
      locations.map((loc: any) => {
        datas.push({
          query: { _id: loc._id },
          data: { accountId: loc.userId }
        });
      });

      this.bulkUpdate(datas).then(() => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify('success', null, 3));
      });
    });
  }
}