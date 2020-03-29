import { Injectable } from '@angular/core';
import { EntityService, HttpStatus } from '../entity.service';
import { AuthService } from '../account/auth.service';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { Observable } from '../../../node_modules/rxjs';
import { IOrder } from '../order/order.model';
import { environment } from '../../environments/environment';
import { IAccount } from '../account/account.model';
import { IPaymentResponse } from '../transaction/transaction.model';
import { PaymentError, PaymentMethod } from './payment.model';

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

  // getSession(): Observable<any> {
  //   const url = this.url + '/session';
  //   return this.doGet(url);
  // }

  stripeAddCredit(token: any, account: IAccount, paid: number, note: string): Observable<IPaymentResponse> {
    const url = this.url + '/stripeAddCredit';
    return this.doPost(url, { token: token, paid: paid, accountId: account._id, accountName: account.username, note: note });
  }

  // stripePayOrder(orderId: string, paid: number, token: any): Observable<IPaymentResponse> {
  //   const url = this.url + '/stripePayOrder';
  //   return this.doPost(url, { token: token, orderId: orderId, paid: paid });
  // }

  snappayAddCredit(account: IAccount, paid: number, paymentMethod: string, note: string): Observable<IPaymentResponse> {
    const url = this.url + '/snappayAddCredit';
    return this.doPost(url, { account: account, paid: paid, paymentMethod: paymentMethod, note: note });
  }

  snappayPayOrder( order: IOrder, paid: number): Observable<IPaymentResponse> {
    const url = this.url + '/snappayPayOrder';
    return this.doPost(url, { order: order, paid: paid });
  }

  // deprecated
  stripeCreateCustomer( tokenId: string, clientId: string, clientName: string, clientPhoneNumber: string): Observable<any> {
    const url = this.url + '/stripeCreateCustomer';
    return this.doPost(url, {source: tokenId, clientId: clientId, clientName: clientName, clientPhoneNumber: clientPhoneNumber});
  }

  // deprecated
  refund(chargeId: string): Observable<any> {
    const url = this.url + '/refund';
    return this.doPost(url, {chargeId: chargeId});
  }

  // deprecated
  addGroupDiscount( clientId: string, merchantId: string, dateType: string, address: string ): Observable<any> {
    const url = this.url + '/addGroupDiscount';
    return this.doPost(url, { clientId: clientId, merchantId: merchantId, dateType: dateType, address: address });
  }

  // deprecated
  removeGroupDiscount( orderId: string ): Observable<any> {
    const url = this.url + '/removeGroupDiscount';
    return this.doPost(url, { orderId: orderId });
  }

  initStripe(htmlCardId, htmlErrorId) {
    const stripe = Stripe(environment.STRIPE.API_KEY);
    const elements = stripe.elements();
    const type = PaymentMethod.CREDIT_CARD;

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
    const card = elements.create(type, { hidePostalCode: true, style: style });

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#' + htmlCardId);

    // Handle real-time validation errors from the card Element.
    card.addEventListener('change', function (event) {
      const displayError = document.getElementById(htmlErrorId);
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    return {stripe: stripe, card: card};
  }

  // fix me
  vaildateCardPay(stripe: any, card: any, htmlErrorId: string) {
    return new Promise((resolve, reject) => {
      if (card._empty) {
        resolve({ err: PaymentError.BANK_CARD_EMPTY, chargeId: '', msg: 'empty card info' });
      } else {
        stripe.createToken(card).then(function (r) {
          if (r.error) {
            // Inform the user if there was an error.
            const errorElement = document.getElementById(htmlErrorId);
            errorElement.textContent = r.error.message;
            resolve({ err: PaymentError.INVALID_BANK_CARD, chargeId: '', msg: r.error.message });
          } else {
            resolve({err: PaymentError.NONE, status: r.status, chargeId: r.chargeId, token: r.token, msg: ''});
          }
        }, err => {
          resolve({ err: PaymentError.INVALID_BANK_CARD, chargeId: '', msg: 'empty card info' });
        });
      }
    });
  }


  // paymentMethodId --- stripe payment method id token
  // order --- when order == null, add credit, when order != null, pay order
  payByCreditCard(appType, paymentMethodId, accountId, accountName, orders, amount, note) {
    const url = this.url + '/payByCreditCard';
    const data = { appType, paymentMethodId, accountId, accountName, orders, amount, note };
    return this.doPost(url, data).toPromise();
  }

  // order --- when order == null, add credit, when order != null, pay order
  payBySnappay(appType, accountId, accountName, orders, amount, note) {
    const url = this.url + '/payBySnappay';
    const data = { appType, accountId, accountName, orders, amount, note };
    return new Promise((resolve, reject) => {
      this.doPost(url, data).toPromise().then(rsp => {
        resolve(rsp);
      });
    });
  }
}
