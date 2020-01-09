import { Injectable } from '@angular/core';
import { AuthService } from '../account/auth.service';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { EntityService } from '../entity.service';
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


  // dateType ---  'today', 'tomorrow'
  load(origin: ILocation, dateType: string, filter: any): Observable<any> {
    const url = this.url + '/load';
    return this.doPost(url, { origin: origin, dateType: dateType }, filter);
  }
}
