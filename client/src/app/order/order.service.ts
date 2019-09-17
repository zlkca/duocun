
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EntityService } from '../entity.service';
import { AuthService } from '../account/auth.service';
import { Observable } from '../../../node_modules/rxjs';



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

  getDistinctArray(items: any, field: string) {
    const a: any[] = [];
    items.map((item: any) => {
      if (item.hasOwnProperty(field)) {
        const b = a.find(x => x[field] === item[field]);
        if (!b) {
          a.push(item);
        }
      }
    });
    return a;
  }

  getGroupDiscount(orders, bNew) {
    const a = this.getDistinctArray(orders, 'clientId');
    if (bNew) { // new order didn't insert yet
      if (a && a.length > 0) {
        return 2;
      } else {
        return 0;
      }
    } else {
      if (a && a.length > 1) {
        return 2;
      } else {
        return 0;
      }
    }
  }

  checkGroupDiscount( clientId: string, delivered: string, address: string ): Observable<any> {
    const url = this.url + '/checkGroupDiscount';
    return this.doPost(url, { clientId: clientId, delivered: delivered, address: address });
  }
}
