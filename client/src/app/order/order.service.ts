
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EntityService, HttpStatus } from '../entity.service';
import { AuthService } from '../account/auth.service';
import { Observable } from '../../../node_modules/rxjs';
import { IOrder } from './order.model';


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

  // for display purpose, update price should be run on backend
  // dateType --- string 'today', 'tomorrow'
  checkGroupDiscount( clientId: string, merchantId: string, dateType: string,  address: string ): Observable<any> {
    const url = this.url + '/checkGroupDiscount';
    return this.doPost(url, { clientId: clientId, merchantId: merchantId, dateType: dateType, address: address });
  }

  // pickup --- has to be '11:20' or '12:00' for now
  updateDeliveryTime( orderId: string, pickup: string ): Observable<IOrder> {
    const url = this.url + '/updateDelivered';
    return this.doPatch(url, { orderId: orderId, pickup: pickup });
  }

  afterRemoveOrder( orderId: string ): Observable<any> {
    const url = this.url + '/afterRemoveOrder';
    return this.doPost(url, { orderId: orderId });
  }

  // afterAddOrder( clientId: string,  merchantId: string, dateType: string,  address: string, paid: number ): Observable<any> {
  //   const url = this.url + '/afterAddOrder';
  //   return this.doPost(url, { clientId: clientId, merchantId: merchantId, dateType: dateType, address: address, paid: paid });
  // }

  loadPage(filter: any, currentPageNumber: number, itemsPerPage: number ): Observable<any> {
    const url = this.url + '/loadPage/' + currentPageNumber + '/' + itemsPerPage;
    return this.doGet(url, filter);
  }

  placeOrders(orders) {
    const url = this.url + '/bulk';
    return new Promise((resolve, reject) => {
      this.doPost(url, orders).toPromise().then(rsp => {
        // if (rsp.status === HttpStatus.OK.code) {
        //   resolve(rsp.data);
        // } else {
          resolve(rsp);
        // }
      });
    });
  }

}
