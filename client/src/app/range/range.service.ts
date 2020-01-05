import { Injectable } from '@angular/core';
import { EntityService } from '../entity.service';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { AuthService } from '../account/auth.service';
import { ILatLng, ILocation } from '../location/location.model';
import { IRange } from './range.model';
import { LocationService } from '../location/location.service';
import { Observable } from '../../../node_modules/rxjs';

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
      if (self.locationSvc.getDirectDistance(origin, { lat: r.lat, lng: r.lng }) < r.radius) {
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
      if (self.locationSvc.getDirectDistance(origin, { lat: r.lat, lng: r.lng }) < r.radius) {
        list.push(r);
      }
    }
    return list;
  }


  inDeliveryRange( origin: ILatLng ): Observable<boolean> {
    const url = this.url + '/inRange';
    return this.doPost(url, { origin: origin });
  }

  findAvailables( origin: ILatLng ): Observable<IRange[]> {
    const url = this.url + '/availables';
    return this.doPost(url, { origin: origin });
  }

  getOverRange( origin: ILatLng ): Observable<IRange[]> {
    const url = this.url + '/overRange';
    return this.doPost(url, { origin: origin });
  }
}
