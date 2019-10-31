import { Injectable } from '@angular/core';
import { EntityService } from '../entity.service';
import { AuthService } from '../account/auth.service';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { Observable } from '../../../node_modules/rxjs';
import { IOrder } from '../order/order.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends EntityService {
  url;
  constructor(
    public authSvc: AuthService,
    public http: HttpClient,
  ) {
    super(authSvc, http);
    this.url = super.getBaseUrl() + 'ClientPayments';
  }

  getSession(): Observable<any> {
    const url = this.url + '/session';
    return this.doGet(url);
  }

  // customerId --- stripe customer id
  stripeCharge(orderId: string, clientId: string, clientName: string, amount: number,
    merchantName: string, token: string): Observable<any> {
    const url = this.url + '/stripeCharge';
    return this.doPost(url, {
      token: token, orderId: orderId, clientId: clientId, clientName: clientName, amount: amount, merchantName: merchantName});
  }

  stripeCreateCustomer( tokenId: string, clientId: string, clientName: string, clientPhoneNumber: string): Observable<any> {
    const url = this.url + '/stripeCreateCustomer';
    return this.doPost(url, {source: tokenId, clientId: clientId, clientName: clientName, clientPhoneNumber: clientPhoneNumber});
  }

  // description: b.merchantName,
  // method: 'pay.webpay',
  // merchant_no: this.cfg.SNAPPAY.MERCHANT_ID,
  // out_order_no: b.orderId,
  // payment_method: b.paymentMethod, // ALIPAY, UNIONPAY
  // trans_amount: b.amount

  snappayCharge( amount: number, merchantName: string, orderId: string, clientId: string, clientName: string,
    paymentMethod: string): Observable<any> {
    const url = this.url + '/snappayCharge';
    return this.doPost(url, {orderId: orderId,
      amount: amount,
      merchantName: merchantName,
      paymentMethod: paymentMethod,
      clientId: clientId,
      clientName: clientName
    });
  }

  refund(chargeId: string): Observable<any> {
    const url = this.url + '/refund';
    return this.doPost(url, {chargeId: chargeId});
  }

  afterAddOrder( clientId: string,  merchantId: string, dateType: string,  address: string, paid: number ): Observable<any> {
    const url = this.url + '/afterAddOrder';
    return this.doPost(url, { clientId: clientId, merchantId: merchantId, dateType: dateType, address: address, paid: paid });
  }

  afterRemoveOrder( orderId: string ): Observable<any> {
    const url = this.url + '/afterRemoveOrder';
    return this.doPost(url, { orderId: orderId });
  }

  addGroupDiscount( clientId: string, merchantId: string, dateType: string, address: string ): Observable<any> {
    const url = this.url + '/addGroupDiscount';
    return this.doPost(url, { clientId: clientId, merchantId: merchantId, dateType: dateType, address: address });
  }

  removeGroupDiscount( orderId: string ): Observable<any> {
    const url = this.url + '/removeGroupDiscount';
    return this.doPost(url, { orderId: orderId });
  }
}
