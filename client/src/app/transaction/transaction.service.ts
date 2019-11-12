import { Injectable } from '@angular/core';
import { EntityService } from '../entity.service';
import { AuthService } from '../account/auth.service';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService extends EntityService {
  url;

  constructor(
    public authSvc: AuthService,
    public http: HttpClient,
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'Transactions';
  }

  // This request will insert 3 transactions, client -> TD (paid), Merchant -> Cash (cost), Cash -> Client (total)
  // action: 'pay by card', 'pay by wechat', 'pay cash'
  saveTransactionsForOrder(merchantId: string, merchantName: string, clientId: string, clientName: string,
    cost: number, total: number, paid: number, action: string): Observable<any> {
      const url = this.url + '/order';
      return this.doPost(url, { merchantId: merchantId, merchantName: merchantName, clientId: clientId, clientName: clientName,
        cost: cost, total: total, paid: paid, action: action });
  }

  checkGroupDiscount( clientId: string, merchantId: string, dateType: string,  address: string ): Observable<any> {
    const url = this.url + '/checkGroupDiscount';
    return this.doPost(url, { clientId: clientId, merchantId: merchantId, dateType: dateType, address: address });
  }
}
