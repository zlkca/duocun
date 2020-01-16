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

  // distance km
  getDeliveryCost(distance: number) {
    if (distance <= 3) {
      return 5;
    } else {
      return 5 + 1.5 * Math.ceil(distance - 3);
    }
  }

  reqRoadDistances(origin: ILocation, destinations: ILocation[]): Observable<any> { // IDistance[]
    const url = this.url + '/Road';

    const address = origin.streetNumber.split(' ').join('+') + '+'
      + origin.streetName.split(' ').join('+') + '+'
      + (origin.subLocality ? origin.subLocality : origin.city).split(' ').join('+') + '+'
      + origin.province;

    const originLocation = { ...origin, address: address};
    return this.doPost(url, { origins: [originLocation], destinations: destinations });
  }
}
