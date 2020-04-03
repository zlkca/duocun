import { DB } from "../db";
import { Model } from "./model";

import { Distance } from "./distance";

export const AppType = {
  FOOD_DELIVERY: 'F',
  GROCERY: 'G',
  FRESH: 'F',
  TELECOM: 'T'
};

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
  appType?: string;
}

export class Area extends Model {
  distanceModel: Distance;
  constructor(dbo: DB) {
    super(dbo, 'areas');
    this.distanceModel = new Distance(dbo);
  }

  // except downtown and appType == G
  async getNearestArea(origin: ILatLng) {
    const areas: any[] = await this.find({ status: 'active' });
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
    return selected;
  }

  // only for appType === G
  async getMyArea(origin: ILatLng) {
    try {
      const areas: IArea[] = await this.find({ appType: AppType.GROCERY });
      if (areas && areas.length > 0 && origin) {
        let found = areas.find((area: IArea) => {
          if (area.coords && area.coords.length > 0) {
            return this.inPolygon(origin, area.coords);
          } else {
            return false;
          }
        });
        return found;
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
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

  // deprecated
  async inDowntownArea(origin: ILatLng) {
    const area = await this.findOne({ code: 'DT' });
    const coords: any = area.coords;
    if (this.inPolygon(origin, coords)) {
      return(area);
    } else {
      return;
    }
  }

  // deprecated
  async getArea(origin: ILatLng) {
    const area = await this.findOne({ code: 'DT' });
    const coords: any = area.coords;
    if (this.inPolygon(origin, coords)) {
      return area;
    } else {
      const area2 = await this.getNearestArea(origin);
      return area2;
    }
  }
}