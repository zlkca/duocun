import { Injectable } from '@angular/core';
import { EntityService } from '../entity.service';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { AuthService } from '../account/auth.service';
import { ILatLng } from '../location/location.model';
import { IRange } from './range.model';
import { LocationService } from '../location/location.service';

@Injectable({
  providedIn: 'root'
})
export class RangeService extends EntityService {
  url;

  constructor(
    public authSvc: AuthService,
    public http: HttpClient,
    public locationSvc: LocationService
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Ranges';
  }

  getRange(origin: ILatLng, ranges: IRange[]) {
    const self = this;
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      if (self.locationSvc.getDirectDistance(origin, { lat: r.lat, lng: r.lng }) < r.radius * 1000) {
        return r;
      }
    }
    return null;
  }

  // getAvailableRanges
  getAvailableRanges(origin: ILatLng, ranges: IRange[]) {
    const self = this;
    const list = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      if (self.locationSvc.getDirectDistance(origin, { lat: r.lat, lng: r.lng }) < r.radius * 1000) {
        list.push(r);
      }
    }
    return list;
  }

  // getNearestRange
}
