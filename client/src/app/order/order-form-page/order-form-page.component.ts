import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { ICart, ICartItem } from '../../cart/cart.model';
import { IMall } from '../../mall/mall.model';
import { Router, ActivatedRoute } from '../../../../node_modules/@angular/router';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { OrderService } from '../order.service';
import { IOrder, ICharge, OrderItem, OrderType, OrderStatus } from '../order.model';
import { PageActions } from '../../main/main.actions';
import { MatSnackBar, MatDialog } from '../../../../node_modules/@angular/material';
import { IDelivery } from '../../delivery/delivery.model';
import { OrderActions } from '../order.actions';
import { IAccount } from '../../account/account.model';
import { LocationService } from '../../location/location.service';

import { environment } from '../../../environments/environment';
import { PaymentService } from '../../payment/payment.service';
import { RangeService } from '../../range/range.service';
import { AccountService } from '../../account/account.service';
import { PhoneVerifyDialogComponent, AccountType } from '../phone-verify-dialog/phone-verify-dialog.component';
import { CartActions } from '../../cart/cart.actions';
import { IMerchant } from '../../merchant/merchant.model';
import { PaymentMethod, PaymentError, PaymentStatus, AppType } from '../../payment/payment.model';
import { SharedService } from '../../shared/shared.service';
import * as moment from 'moment';

@Component({
  selector: 'app-order-form-page',
  templateUrl: './order-form-page.component.html',
  styleUrls: ['./order-form-page.component.scss']
})
export class OrderFormPageComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<any>();
  malls: IMall[] = [];
  form;
  account: IAccount;
  items: ICartItem[];
  order: IOrder; // used for identifing new order or not, now used for updating paymentMethod info
  address: string;    // for display
  balance: number;
  card;
  stripe;
  charge: ICharge;
  afterGroupDiscount: number;
  bSubmitted = false;
  fromPage: string; // params from previous page
  action: string;   // params from previous page

  // state start
  loading = true;
  merchant: IMerchant;
  delivery: IDelivery;
  cart;
  paymentMethod = PaymentMethod.CASH;
  // state end

  // const
  PaymentMethod = PaymentMethod;
  lang = environment.language;

  constructor(
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private route: ActivatedRoute,
    private rangeSvc: RangeService,
    private orderSvc: OrderService,
    private sharedSvc: SharedService,
    private locationSvc: LocationService,
    private accountSvc: AccountService,
    private paymentSvc: PaymentService,
    private snackBar: MatSnackBar,
    public dialogSvc: MatDialog
  ) {
    const self = this;

    this.form = this.fb.group({
      note: ['']
    });
    this.fromPage = this.route.snapshot.queryParamMap.get('fromPage');
    this.action = this.route.snapshot.queryParamMap.get('action');

    // update footer
    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: { name: 'order-form' } });

    // load delivery date and location
    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      self.delivery = x;
      self.address = this.locationSvc.getAddrString(x.origin);
    });

    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
    });

    this.rx.select<IMerchant>('merchant').pipe(takeUntil(this.onDestroy$)).subscribe((m: IMerchant) => {
      this.merchant = m;
    });
  }

  ngOnInit() {
    const self = this;
    // this.loading = true;  // show loading ... animation

    // trigger payment from the page of phone number verification
    if (this.fromPage === 'order-form') {
      this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
        self.account = account;
        self.balance = account.balance;
        self.bSubmitted = false;
        const origin = self.delivery.origin;
        const groupDiscount = 0; // bEligible ? 2 : 0;
        if (origin) {
          self.rangeSvc.getOverRange(origin).pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
            self.charge = self.getSummary(self.cart, self.merchant, (r.distance * r.rate), groupDiscount);
            self.paymentMethod = self.order ? self.paymentMethod : PaymentMethod.CASH;
            setTimeout(() => {
              if (self.paymentMethod === PaymentMethod.CREDIT_CARD) {
                const rt = self.paymentSvc.initStripe('card-element', 'card-errors');
                this.stripe = rt.stripe;
                this.card = rt.card;
              }

              if (this.action === 'pay') {
                self.doPay(account, this.merchant, this.charge, this.cart, this.delivery, this.paymentMethod).then((rt: any) => {
                  this.showError(rt.err);
                  // this.loading = false; // hide loading ... animation
                  this.bSubmitted = false;

                  if (rt.err === PaymentError.NONE) {
                    if (self.paymentMethod === PaymentMethod.WECHAT) {
                      window.location.href = rt.url;
                    } else {
                      self.router.navigate(['order/history']);
                    }
                  }
                });
              } else {
                // self.loading = false;
                this.bSubmitted = false;
              }
            }, 100);
          });
        } else {
          // self.loading = false;
          console.log('getOverRange require origin');
        }
      });
    } else { // normal procedure from restaurant detail page
      this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
        self.account = account;
        self.balance = account ? account.balance : 0;

        const cart: ICart = this.cart;
        const merchant = this.merchant;

        if (cart) {
          const origin = self.delivery.origin;
          const groupDiscount = 0; // bEligible ? 2 : 0;
          if (origin) {
            self.rangeSvc.getOverRange(origin).pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
              this.charge = this.getSummary(cart, merchant, (r.distance * r.rate), groupDiscount);
              this.paymentMethod = (self.balance >= this.charge.total) ? PaymentMethod.PREPAY : self.paymentMethod;
              this.rx.dispatch({
                type: OrderActions.UPDATE_PAYMENT_METHOD,
                payload: { paymentMethod: this.paymentMethod }
              });
              this.afterGroupDiscount = Math.round((!groupDiscount ? this.charge.total : (this.charge.total - 2)) * 100) / 100;
              // self.loading = false;
            });
          } else {
            // self.loading = false;
            console.log('getOverRange need origin');
          }
        } else {
          // self.loading = false;
        }
      });
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getCost(items: any[]) {
    let cost = 0;
    let price = 0;
    items.map(x => {
      cost += (x.cost * x.quantity);
      price += (x.price * x.quantity);
    });
    return { cost: cost, price: price };
  }

  getSummary(cart: ICart, merchant: IMerchant, overRangeCharge: number, groupDiscount: number) {
    let price = 0;
    let cost = 0;

    const items: ICartItem[] = [];
    if (cart.items && cart.items.length > 0) {
      cart.items.map(x => {
        price += x.price * x.quantity;
        cost += x.cost * x.quantity;
        items.push(x);
      });
    }

    const subTotal = price + merchant.deliveryCost;
    const tax = Math.ceil(subTotal * 13) / 100;
    const tips = 0;
    const overRangeTotal = Math.round(overRangeCharge * 100) / 100;
    return {
      price: price,
      cost: cost,
      overRangeCharge: overRangeTotal,
      deliveryCost: merchant.deliveryCost,
      deliveryDiscount: merchant.deliveryCost,
      groupDiscount: groupDiscount,
      tips: tips,
      tax: tax,
      total: price + tax + tips - groupDiscount + overRangeTotal
    };
  }

  // delivery --- only need 'origin' and 'dateType' fields
  createOrder(account: IAccount, merchant: IMerchant, cart: ICart, delivery: IDelivery, charge: ICharge,
    note: string, paymentMethod: string): IOrder {

    const items: OrderItem[] = cart.items.filter(x => x.merchantId === cart.merchantId).map(it => {
      return {
        productId: it.productId,
        quantity: it.quantity,
        price: it.price,
        cost: it.cost
      };
    });

    const sCreated = moment().toISOString();
    const { deliverDate, deliverTime } = this.sharedSvc.getDeliveryDateTimeByPhase(sCreated, merchant.phases, delivery.dateType);
    const status = (paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.WECHAT) ?
      OrderStatus.TEMP : OrderStatus.NEW; // prepay need Driver to confirm finished
    const paymentStatus = paymentMethod === PaymentMethod.PREPAY ? PaymentStatus.PAID : PaymentStatus.UNPAID;
    const order: IOrder = {
      clientId: account._id,
      clientName: account.username,
      defaultPickupTime: account.pickup,
      merchantId: merchant._id,
      merchantName: this.lang === 'zh' ? merchant.name : merchant.nameEN,
      items,
      price: Math.round(charge.price * 100) / 100,
      cost: Math.round(charge.cost * 100) / 100,
      location: delivery.origin,
      pickupTime: '11:20',
      deliverDate,  // eg. 2020-12-03
      deliverTime,  // eg. 11:20
      note,
      deliveryCost: Math.round(merchant.deliveryCost * 100) / 100,
      deliveryDiscount: Math.round(merchant.deliveryCost * 100) / 100,
      groupDiscount: Math.round(charge.groupDiscount * 100) / 100,
      overRangeCharge: Math.round(charge.overRangeCharge * 100) / 100,
      total: Math.round(charge.total * 100) / 100,
      tax: Math.round(charge.tax * 100) / 100,
      tips: Math.round(charge.tips * 100) / 100,
      type: OrderType.FOOD_DELIVERY,
      status,
      paymentStatus,
      paymentMethod,
      orderType: OrderType.FOOD_DELIVERY
      // dateType: delivery.dateType // this.sharedSvc.getDateType(delivery.date)
    };

    return order;
  }

  // ------------------------------------------------------
  // after verify call this function
  pay() {
    const account = this.account;
    const merchant = this.merchant;
    const charge = this.charge;
    const delivery = this.delivery;
    const cart = this.cart;
    const paymentMethod = this.paymentMethod;
    // this.loading = true;  // show loading ... animation
    this.bSubmitted = true;
    this.doPay(account, merchant, charge, cart, delivery, paymentMethod).then((rt: any) => {
      this.showError(rt.err);
      // this.loading = false; // hide loading ... animation
      this.bSubmitted = false;
      if (rt.err === PaymentError.NONE) {
        if (this.paymentMethod === PaymentMethod.WECHAT) {
          window.location.href = rt.url;
        } else {
          this.router.navigate(['order/history']);
        }
      }
    });
  }

  showError(err: string) {
    const missingInfoHint = this.lang === 'en' ? 'Missing phone number or address' : '缺少电话或地址';
    const dupInfoHint = this.lang === 'en' ? 'Can not submit duplicated order' : '无法重复提交订单';
    const emptyCartHint = this.lang === 'en' ? 'The Shopping cart is empty' : '购物车是空的';
    const payAlert = this.lang === 'en' ? 'Unsuccessful payment, please contact our customer service.' : '付款未成功，请联系客服';

    if (err === PaymentError.PHONE_EMPTY) {
      this.openPhoneVerifyDialog(); // fix me
    } else if (err === PaymentError.LOCATION_EMPTY) {
      alert(missingInfoHint);
    } else if (err === PaymentError.CART_EMPTY) {
      alert(emptyCartHint);
    } else if (err === PaymentError.DUPLICATED_SUBMIT) {
      this.snackBar.open('', dupInfoHint, { duration: 1000 });
    } else if (err === PaymentError.BANK_CARD_FAIL || err === PaymentError.WECHATPAY_FAIL) {
      alert(payAlert);
    } else {
      // pass
    }
  }

  doPay(account: IAccount, merchant: IMerchant, charge: ICharge, cart: ICart, delivery: IDelivery, paymentMethod: string) {
    const self = this;
    const v = this.form.value;
    const order = self.createOrder(account, merchant, cart, delivery, charge, v.note, paymentMethod); // Create an unpaid order
    const balance: number = account.balance;
    const amount = Math.round((order.total - balance) * 100) / 100;
    const note = v.note;

    this.accountSvc.update({ _id: account._id }, { type: 'client' }).pipe(takeUntil(self.onDestroy$)).subscribe(ret => { });

    return new Promise((resolve, reject) => {
      if (!account || !account.phone || !account.verified) {
        resolve({ err: PaymentError.PHONE_EMPTY });
      } else if (!(account && delivery && delivery.origin)) {
        resolve({ err: PaymentError.LOCATION_EMPTY });
        // } else if (this.bSubmitted) {
        //   resolve({ err: PaymentError.DUPLICATED_SUBMIT });
      } else if (!(cart && cart.items && cart.items.length > 0)) {
        resolve({ err: PaymentError.CART_EMPTY });
      } else {
        this.orderSvc.placeOrders([order]).then(newOrders => {
          if (paymentMethod === PaymentMethod.CREDIT_CARD) {
            this.stripe.createPaymentMethod({
              type: 'card',
              card: this.card,
              billing_details: {
                name: account.username
              }
            }).then(result => {
              if (result.error) {
                // An error happened when collecting card details, show `result.error.message` in the payment form.
                resolve({ err: PaymentError.BANK_CARD_FAIL });
              } else {
                const paymentMethodId = result.paymentMethod.id;
                this.paymentSvc.payByCreditCard(AppType.FOOD_DELIVERY, paymentMethodId, account._id, account.username, newOrders,
                  amount, note).then((rsp: any) => {
                  resolve({ err: rsp.err });
                });
              }
            });
          } else if (paymentMethod === PaymentMethod.WECHAT) {
            this.paymentSvc.payBySnappay(AppType.FOOD_DELIVERY, account._id, account.username, newOrders,
               amount, note).then((rsp: any) => {
              resolve({ err: rsp.err, url: rsp.url });
            });
          } else { // PaymentMethod.CASH || PaymentMethod.PREPAY
            resolve({ err: PaymentError.NONE });
          }
        });
      }
    });
  }

  // handleCardPayment(account: IAccount, token: any, order: IOrder, cart: ICart) {
  //   const self = this;
  //   const balance: number = account.balance;
  //   const payable = Math.round((order.total - balance) * 100) / 100;
  //   const payHint = this.lang === 'en' ? 'The order is placed and paid successfully' : '已成功下单';
  //   order.status = OrderStatus.TEMP;

  //   // tslint:disable-next-line:no-shadowed-variable
  //   return new Promise((resolve, reject) => {
  //     // save order and update balance
  //     self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((ret: IOrder) => {
  //       const orderId = ret._id;
  //       const merchantId = ret.merchantId;
  //       const items: ICartItem[] = cart.items.filter(x => x.merchantId === merchantId);

  //       self.paymentSvc.stripePayOrder(orderId, payable, token).pipe(takeUntil(self.onDestroy$)).subscribe((rsp: IPaymentResponse) => {
  //         if (rsp.status === ResponseStatus.SUCCESS) {
  //           self.snackBar.open('', payHint, { duration: 2000 });
  //           self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } }); // should be clear cart ?
  //         }
  //         const error = rsp.status === ResponseStatus.SUCCESS ? PaymentError.NONE : PaymentError.BANK_CARD_FAIL;
  //         resolve({ err: error });
  //       });
  //     });
  //   });
  // }

  // handleSnappayPayment(account: IAccount, order: IOrder, cart: ICart) {
  //   const self = this;
  //   const balance: number = account.balance;
  //   const payable = Math.round((order.total - balance) * 100) / 100;

  //   order.status = OrderStatus.TEMP;

  //   // tslint:disable-next-line:no-shadowed-variable
  //   return new Promise((resolve, reject) => {
  //     // save order and update balance
  //     self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((ret: IOrder) => {
  //       const merchantId = ret.merchantId;
  //       const items: ICartItem[] = cart.items.filter(x => x.merchantId === merchantId);

  //       this.paymentSvc.snappayPayOrder(ret, payable).pipe(takeUntil(self.onDestroy$)).subscribe((rsp: IPaymentResponse) => {
  //         if (rsp.status === ResponseStatus.SUCCESS) {
  //           self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
  //         }
  //         const error = rsp.status === ResponseStatus.SUCCESS ? PaymentError.NONE : PaymentError.WECHATPAY_FAIL;
  //         resolve({ err: error, url: rsp.url });
  //       });
  //     });
  //   });

  // }

  // // only happend on balance < order.total
  // handleWithCash(account: IAccount, order: IOrder, cart: ICart) {
  //   const self = this;
  //   const balance: number = account.balance;
  //   const orderSuccessHint = this.lang === 'en' ? 'The order is placed successfully' : '已成功下单';

  //   // tslint:disable-next-line:no-shadowed-variable
  //   return new Promise((resolve, reject) => {
  //     if (order && order._id) { // modify order, now do not support
  //       const orderId = order._id;

  //       self.orderSvc.update({ _id: orderId }, order).pipe(takeUntil(this.onDestroy$)).subscribe((r: IOrder) => {
  //         const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === r.merchantId);
  //         self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
  //         self.snackBar.open('', orderSuccessHint, { duration: 2000 });
  //         resolve({ err: PaymentError.NONE, type: 'update', order: r });
  //       });
  //     } else { // create new
  //       if (balance >= order.total) {
  //         order.paymentStatus = PaymentStatus.PAID;
  //       }

  //       self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((orderCreated: IOrder) => {
  //         self.snackBar.open('', orderSuccessHint, { duration: 1800 });
  //         const items: ICartItem[] = cart.items.filter(x => x.merchantId === order.merchantId);
  //         self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
  //         resolve({ err: PaymentError.NONE, type: 'new', order: orderCreated });
  //       });
  //     } // end of create new
  //   });
  // }


  onSelectPaymentMethod(paymentMethod) {
    this.paymentMethod = paymentMethod;
  }

  openPhoneVerifyDialog(): void {
    const dialogRef = this.dialogSvc.open(PhoneVerifyDialogComponent, {
      width: '300px',
      data: {
        title: 'Signup', content: '', buttonTextNo: '取消', buttonTextYes: '删除', account: this.account
      },
      panelClass: 'phone-verify-dialog'
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      this.account = account;
      if (account) {
        this.pay();
      }
    });
  }

  getAbs(n) {
    return Math.abs(n);
  }


  onPay() {
    const self = this;
    const merchant = this.merchant;
    const delivery = this.delivery;
    const cart = this.cart;
    const paymentMethod = this.paymentMethod;
    const origin = delivery.origin;
    const groupDiscount = 0; // bEligible ? 2 : 0;

    // this.loading = true;  // show loading ... animation
    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      if (account) {
        this.balance = account.balance;

        if (origin) {
          self.rangeSvc.getOverRange(origin).pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
            this.charge = this.getSummary(cart, merchant, (r.distance * r.rate), groupDiscount);
            if (account.type === AccountType.TEMP) { // For no logged in user who get the verification code, but didn't finish verify
              // this.loading = false;
              this.bSubmitted = false;
              this.openPhoneVerifyDialog();
            } else {
              if (!this.bSubmitted) {
                this.bSubmitted = true;
                self.doPay(account, self.merchant, self.charge, cart, delivery, paymentMethod).then((rt: any) => {
                  this.showError(rt.err);
                  // this.loading = false; // hide loading ... animation
                  this.bSubmitted = false;

                  if (rt.err === PaymentError.NONE) {

                    this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: [] });

                    if (paymentMethod === PaymentMethod.WECHAT) {
                      window.location.href = rt.url;
                    } else {
                      self.router.navigate(['order/history']);
                    }
                  }
                });
              }
            }
          });
        } else { // no location, should never go here
          // this.loading = false;
          console.log('pay command require origin');
        }
      } else { // didn't login
        // this.loading = false;
        this.openPhoneVerifyDialog();
      }
    });
  }

  onCreditCardFormInit(e) {
    this.stripe = e.stripe;
    this.card = e.card;
  }
}
