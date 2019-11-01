import { Injectable } from '@angular/core';
import { AuthService } from '../account/auth.service';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { EntityService } from '../entity.service';
import * as moment from 'moment';
import { IRestaurant } from '../restaurant/restaurant.model';
import { ILocation } from '../location/location.model';
import { Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class MerchantService extends EntityService {
  constructor(
    public authSvc: AuthService,
    public http: HttpClient
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Restaurants';
  }


  isClosed(restaurant: IRestaurant, dateType: string) {
    const dt = dateType === 'today' ? moment() : moment().add(1, 'days');
    if (restaurant.closed) { // has special close day
      if (restaurant.closed.find(d => moment(d).isSame(dt, 'day'))) {
        return true;
      } else {
        return this.isClosePerWeek(restaurant, dt);
      }
    } else {
      return this.isClosePerWeek(restaurant, dt);
    }
  }

  // dateTime --- moment object
  isClosePerWeek(restaurant: IRestaurant, dateTime: any) {
    if (restaurant.dow && dateTime) {
      const days = restaurant.dow.split(',');
      if (days && days.length > 0) {
        const r = days.find(d => dateTime.day() === +d);
        return r ? false : true;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }


  // dateType ---  'today', 'tomorrow'
  load(origin: ILocation, dateType: string, filter: any): Observable<any> {
    const url = this.url + '/load';
    return this.doPost(url, { origin: origin, dateType: dateType }, filter);
  }
}
