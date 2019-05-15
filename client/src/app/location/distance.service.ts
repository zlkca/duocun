import { Injectable } from '@angular/core';
import { EntityService } from '../entity.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../account/auth.service';
import { IDeliveryTime } from '../delivery/delivery.model';
import { ILocation } from './location.model';
import { Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class DistanceService extends EntityService {

  constructor(
    public http: HttpClient,
    public authSvc: AuthService
  ) {
    super(authSvc, http);
    this.url = this.getBaseUrl() + 'Distances';
  }

  getDeliveryCost(distance: number) {
    if (distance <= 3) {
      return 5;
    } else {
      return 5 + 1.5 * Math.ceil(distance - 3);
    }
  }

  getDeliveryFee(distance: number, deliverTime: IDeliveryTime) {
      // if (distance <= 3) {
      //   return 3;
      // } else {
      //   return 3 + 1.5 * Math.ceil(distance - 3);
      // }
      return 0;
  }

  reqRoadDistances(origin: ILocation, destinations: ILocation[]): Observable<any> { // IDistance[]
    const url = this.url + '/Road';
    return this.http.post(url, { origins: [origin], destinations: destinations });
  }
}
