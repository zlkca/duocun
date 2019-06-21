
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EntityService } from '../entity.service';
import { AuthService } from '../account/auth.service';



@Injectable()
export class OrderService extends EntityService {
  url;

  constructor(
    public authSvc: AuthService,
    public http: HttpClient
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Orders';
  }


}
