import { Injectable } from '@angular/core';
// import { RestaurantApi, LoopBackFilter, GeoPoint, Order, OrderApi, Product, Picture, PictureApi } from '../lb-sdk';
import * as moment from 'moment';
import { Restaurant, IRestaurant } from './restaurant.model';
import { Observable } from 'rxjs';
import { mergeMap, flatMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../account/auth.service';
import { EntityService } from '../entity.service';
import { IDeliveryTime } from '../delivery/delivery.model';
import { IMall } from '../mall/mall.model';

@Injectable()
export class RestaurantService extends EntityService {

  constructor(
    public authSvc: AuthService,
    public http: HttpClient
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Restaurants';
  }

  isClosed(restaurant: IRestaurant, deliveryTime: IDeliveryTime) {
    const deliverDate = moment(deliveryTime.from);
    // const tomorrow = moment().add(1, 'days');
    // const afterTomorrow = moment().add(2, 'days');

    if (restaurant.closed) { // has special close day
      if (restaurant.closed.find(d => moment(d).isSame(deliverDate, 'day'))) {
        return true;
      } else {
        return this.isClosePerWeek(restaurant, deliveryTime);
      }
    } else {
      return this.isClosePerWeek(restaurant, deliveryTime);
    }
  }

  isClosePerWeek(restaurant: IRestaurant, deliveryTime: IDeliveryTime) {
    if (restaurant.dow && restaurant.dow.length > 0) {
      const openAll = restaurant.dow.find(d => d === 'all');
      if (openAll) {
        return false;
      } else {
        const r = restaurant.dow.find(d => moment(deliveryTime.from).day() === +d);
        return r ? false : true;
      }
    } else {
      return true;
    }
  }
}
