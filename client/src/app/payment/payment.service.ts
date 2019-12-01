import { Injectable } from '@angular/core';
import { EntityService } from '../entity.service';
import { AuthService } from '../account/auth.service';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { Observable } from '../../../node_modules/rxjs';
import { IOrder } from '../order/order.model';
import { environment } from '../../environments/environment';
import { IAccount } from '../account/account.model';

declare var Stripe;
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


  stripeAddCredit(token: any, account: IAccount, paid: number, note: string): Observable<any> {
    const url = this.url + '/stripeAddCredit';
    return this.doPost(url, { token: token, paid: paid, accountId: account._id, accountName: account.username, note: note });
  }

  // pickup --- time
  stripePayOrder(order: IOrder, paid: number, token: any, pickup: string): Observable<any> {
    const url = this.url + '/stripePayOrder';
    return this.doPost(url, { token: token, order: order, paid: paid, pickup: pickup });
  }

  stripeCreateCustomer( tokenId: string, clientId: string, clientName: string, clientPhoneNumber: string): Observable<any> {
    const url = this.url + '/stripeCreateCustomer';
    return this.doPost(url, {source: tokenId, clientId: clientId, clientName: clientName, clientPhoneNumber: clientPhoneNumber});
  }


  snappayAddCredit(account: IAccount, paid: number, paymentMethod: string, note: string): Observable<any> {
    const url = this.url + '/snappayAddCredit';
    return this.doPost(url, { account: account, paid: paid, paymentMethod: paymentMethod, note: note });
  }
  // description: b.merchantName,
  // method: 'pay.webpay',
  // merchant_no: this.cfg.SNAPPAY.MERCHANT_ID,
  // out_order_no: b.orderId,
  // payment_method: b.paymentMethod, // ALIPAY, UNIONPAY
  // trans_amount: b.amount

  snappayPayOrder( order: IOrder, paid: number): Observable<any> {
    const url = this.url + '/snappayPayOrder';
    return this.doPost(url, { order: order, paid: paid });
  }

  refund(chargeId: string): Observable<any> {
    const url = this.url + '/refund';
    return this.doPost(url, {chargeId: chargeId});
  }



  addGroupDiscount( clientId: string, merchantId: string, dateType: string, address: string ): Observable<any> {
    const url = this.url + '/addGroupDiscount';
    return this.doPost(url, { clientId: clientId, merchantId: merchantId, dateType: dateType, address: address });
  }

  removeGroupDiscount( orderId: string ): Observable<any> {
    const url = this.url + '/removeGroupDiscount';
    return this.doPost(url, { orderId: orderId });
  }



  initStripe() {
    const stripe = Stripe(environment.STRIPE.API_KEY);
    const elements = stripe.elements();

    // Custom styling can be passed to options when creating an Element.
    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create an instance of the card Element.
    const card = elements.create('card', { hidePostalCode: true, style: style });

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    card.addEventListener('change', function (event) {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    return {stripe: stripe, card: card};
  }

  vaildateCardPay(stripe: any, card: any) {
    return new Promise((resolve, reject) => {
      if (card._empty) {
        resolve({ status: 'failed', chargeId: '', msg: 'empty card info' });
      } else {
        stripe.createToken(card).then(function (result) {
          if (result.error) {
            // Inform the user if there was an error.
            const errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
            resolve({ status: 'failed', chargeId: '', msg: result.error.message });
          } else {
            resolve(result); // {status:x, chargeId:'', msg: '', token:x}
          }
        }, err => {
          resolve({ status: 'failed', chargeId: '', msg: 'empty card info' });
        });
      }
    });
  }
}
