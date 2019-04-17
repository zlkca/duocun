import { Injectable } from '@angular/core';
import { EntityService } from '../entity.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../account/auth.service';

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

  getFullDeliveryFee(distance: number) {
    if (distance <= 3) {
      return 5;
    } else {
      return 5 + 1.5 * Math.ceil(distance - 3);
    }
  }

  getDeliveryFee(distance: number, deliverTimeType: string) {
    if (deliverTimeType === 'immediate') {
      if (distance <= 3) {
        return 3;
      } else {
        return 3 + 1.5 * Math.ceil(distance - 3);
      }
    } else {
      return 0;
    }
  }

}