import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../account/auth.service';
import { EntityService } from '../entity.service';
import { Delivery } from './delivery.model';
import { Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService extends EntityService {

  url;

  constructor(
    public http: HttpClient,
    public authSvc: AuthService
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Deliveries';
  }

  save(d: Delivery): Observable<any> {
    return this.http.post(this.url, d);
  }

  replace(d: Delivery): Observable<any> {
    return this.http.put(this.url, d);
  }
}
