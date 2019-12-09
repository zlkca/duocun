import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { ICart, ICartItem } from '../../cart/cart.model';
import { IMall } from '../../mall/mall.model';
import { IContact, Contact } from '../../contact/contact.model';
import { Router, ActivatedRoute } from '../../../../node_modules/@angular/router';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { OrderService } from '../order.service';
import { IOrder, IOrderItem, ICharge, OrderItem, OrderType } from '../order.model';
import { CartActions } from '../../cart/cart.actions';
import { PageActions } from '../../main/main.actions';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { IDeliveryTime, IDelivery } from '../../delivery/delivery.model';
import { OrderActions } from '../order.actions';
import { IAccount, Role } from '../../account/account.model';
import { LocationService } from '../../location/location.service';
import { ILocation, IDistance, RangeRole } from '../../location/location.model';
import * as moment from 'moment';
import { MerchantService } from '../../merchant/merchant.service';

import { environment } from '../../../environments/environment';
import { PaymentService } from '../../payment/payment.service';
import { TransactionService } from '../../transaction/transaction.service';
import { DistanceService } from '../../location/distance.service';
import { MallService } from '../../mall/mall.service';
import { RangeService } from '../../range/range.service';
import { IRange } from '../../range/range.model';
import { ICommand } from '../../shared/command.reducers';
import { CommandActions } from '../../shared/command.actions';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { SharedService } from '../../shared/shared.service';
import { AccountService } from '../../account/account.service';
import { ContactService } from '../../contact/contact.service';

declare var Stripe;
declare var window;

const DEFAULT_ADMIN = environment.DEFAULT_ADMIN;

@Component({
  selector: 'app-order-form-page',
  templateUrl: './order-form-page.component.html',
  styleUrls: ['./order-form-page.component.scss']
})
export class OrderFormPageComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<any>();
  cart;
  subtotal;
  total = 0;
  tips = 0;
  malls: IMall[] = [];
  productTotal = 0;
  deliveryDiscount = 0;
  deliveryCost = 0;
  tax = 0;
  contact: IContact;
  form;
  account: IAccount;
  items: ICartItem[];
  order: IOrder; // used for identifing new order or not, now used for updating paymentMethod info
  delivery: IDelivery;
  address: string;
  balance: number;
  groupDiscount = 0;
  paymentMethod = 'cash';
  card;
  stripe;
  loading = true;

  charge: ICharge;
  afterGroupDiscount: number;
  bSubmitted = false;
  fromPage = '';

  msg = '';
  log = '';

  constructor(
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private route: ActivatedRoute,
    private mallSvc: MallService,
    private rangeSvc: RangeService,
    private contactSvc: ContactService,
    private orderSvc: OrderService,
    private merchantSvc: MerchantService,
    private locationSvc: LocationService,
    private accountSvc: AccountService,
    private paymentSvc: PaymentService,
    private distanceSvc: DistanceService,
    private transactionSvc: TransactionService,
    private snackBar: MatSnackBar
  ) {
    const self = this;

    this.form = this.fb.group({
      note: ['']
    });

    // update footer
    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: { name: 'order-form' } });

    // this.rx.select('account').pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
    //   self.account = account;
    //   this.balance = account.balance;
    // });

    // load delivery date and location
    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      self.delivery = x;
      self.address = this.locationSvc.getAddrString(x.origin);
    });

    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
    });

    // for modify order and update paymentMethod field
    this.rx.select('order').pipe(takeUntil(this.onDestroy$)).subscribe((order: IOrder) => {
      this.order = order;
    });

    // this.rx.select<IContact>('contact').pipe(takeUntil(this.onDestroy$)).subscribe(x => {
    //   self.contact = x;
    //   const fromPage = this.route.snapshot.queryParamMap.get('fromPage');
    //   if (fromPage === 'order-form') {
    //     this.accountSvc.getCurrentUser().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
    //       self.account = account;
    //       const origin = self.delivery.origin;
    //       const groupDiscount = 0; // bEligible ? 2 : 0;
    //       self.getOverRange(origin, (distance, rate) => {
    //         this.charge = this.getCharge(this.cart, (distance * rate), groupDiscount);
    //         this.paymentMethod = (account.balance >= this.charge.total) ? 'prepaid' : self.paymentMethod;
    //         self.doPay(this.contact, account, this.charge, this.cart, this.delivery, this.paymentMethod);
    //       });
    //     });
    //   }
    // });

    // ----------------------------------------------
    // trigger payment process from footer
    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'pay') {
        this.rx.dispatch({ type: CommandActions.SEND, payload: { name: '' } });
        const contact = x.args.contact;
        const account = x.args.account;
        const delivery = x.args.delivery;
        const cart = x.args.cart;
        const paymentMethod = x.args.paymentMethod;

        this.loading = false;
        this.paymentMethod = paymentMethod;
        this.balance = account.balance;
        // this.contactSvc.find({accountId: account._id}).pipe(takeUntil(this.onDestroy$)).subscribe((contact: IContact) => {

        const origin = delivery.origin;
        const groupDiscount = 0; // bEligible ? 2 : 0;
        self.getOverRange(origin, (distance, rate) => {
          this.charge = this.getCharge(cart, (distance * rate), groupDiscount);
          self.doPay(contact, account, self.charge, cart, delivery, paymentMethod);
        });
      }
    });
  }

  ngOnInit() {
    const self = this;
    this.loading = false;
    this.fromPage = this.route.snapshot.queryParamMap.get('fromPage');

    // trigger payment from the page of phone number verification
    if (this.fromPage === 'order-form') {
      this.accountSvc.getCurrentUser().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
        this.contactSvc.find({ accountId: account._id }).pipe(takeUntil(this.onDestroy$)).subscribe((contacts: IContact[]) => {
          self.contact = contacts[0];
          self.account = account;
          self.balance = account.balance;
          self.loading = false;
          self.bSubmitted = false;
          const origin = self.delivery.origin;
          const groupDiscount = 0; // bEligible ? 2 : 0;
          self.getOverRange(origin, (distance, rate) => {
            this.charge = this.getCharge(this.cart, (distance * rate), groupDiscount);
            this.paymentMethod = this.order.paymentMethod;
            this.loading = false;
            setTimeout(() => {
              if (self.paymentMethod === 'card') {
                const rt = self.paymentSvc.initStripe('card-element', 'card-errors');
                this.stripe = rt.stripe;
                this.card = rt.card;
              }
              self.doPay(self.contact, account, this.charge, this.cart, this.delivery, this.paymentMethod);
            }, 800);
          });
        });
      });
    } else { // normal procedure
      this.accountSvc.getCurrentUser().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
        self.account = account;

        this.contactSvc.find({ accountId: account._id }).pipe(takeUntil(this.onDestroy$)).subscribe((contacts: IContact[]) => {
          self.contact = contacts[0];
          const balance = account.balance;
          self.balance = balance;
          // const accountId = this.account._id;
          const cart: ICart = this.cart;
          // const bNewOrder = (order && order._id) ? false : true;

          // fix me
          if (cart) {
            this.merchantSvc.find({ _id: cart.merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe((ms: IRestaurant[]) => {
              const merchant: IRestaurant = ms[0];
              // const merchantId = merchant._id;
              const origin = self.delivery.origin;
              // const address = this.locationSvc.getAddrString(origin);

              // this.orderSvc.checkGroupDiscount(accountId, merchantId, dateType, address)
              // .pipe(takeUntil(this.onDestroy$)).subscribe(bEligible => {
              const groupDiscount = 0; // bEligible ? 2 : 0;
              self.getOverRange(origin, (distance, rate) => {
                this.charge = this.getCharge(cart, (distance * rate), groupDiscount);
                this.paymentMethod = (balance >= this.charge.total) ? 'prepaid' : self.paymentMethod;
                this.rx.dispatch({
                  type: OrderActions.UPDATE_PAYMENT_METHOD,
                  payload: { paymentMethod: this.paymentMethod }
                });
                this.afterGroupDiscount = Math.round((!groupDiscount ? this.charge.total : (this.charge.total - 2)) * 100) / 100;
                self.loading = false;
                self.groupDiscount = groupDiscount;
              });
              // });
            });
          }
        });
      });
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getOverRange(origin: ILocation, cb?: any) {
    const self = this;
    const destinations: ILocation[] = [];
    const qDist = { _id: '5d671c2f6f69011d1bd42f6c' }; // TNT mall

    this.rangeSvc.find({ roles: [RangeRole.FREE_CENTER] }).pipe(takeUntil(this.onDestroy$)).subscribe((rs: IRange[]) => {
      const ranges = self.rangeSvc.getAvailableRanges({ lat: origin.lat, lng: origin.lng }, rs);
      if (ranges && ranges.length > 0) {
        const r = rs[0];
        if (cb) {
          cb(0, r.overRangeRate);
        }
      } else {
        self.mallSvc.find(qDist).pipe(takeUntil(this.onDestroy$)).subscribe((ms: IMall[]) => {
          ms.map(m => {
            destinations.push({ lat: m.lat, lng: m.lng, placeId: m.placeId });
          });

          self.distanceSvc.reqRoadDistances(origin, destinations).pipe(takeUntil(this.onDestroy$)).subscribe((ds: IDistance[]) => {
            if (ds && ds.length > 0) {
              const r = rs[0];
              const d = (+(ds[0].element.distance.value) - r.radius * 1000) / 1000;
              const distance = d > 0 ? d : 0; // kilo meter
              if (cb) {
                cb(distance, r.overRangeRate);
              }
            } else {
              cb(5, 0); // should never go here
            }
          }, err => {
            console.log(err);
          });
        });
      }
    });
  }

  getCharge(cart, overRangeCharge, groupDiscount) {
    let productTotal = 0;

    const items: ICartItem[] = [];
    if (cart.items && cart.items.length > 0) {
      cart.items.map(x => {
        productTotal += x.price * x.quantity;
        items.push(x);
      });
    }

    const subTotal = productTotal + cart.deliveryCost;
    const tax = Math.ceil(subTotal * 13) / 100;
    const tips = 0;
    const overRangeTotal = Math.round(overRangeCharge * 100) / 100;
    return {
      productTotal: productTotal,
      deliveryCost: cart.deliveryCost,
      deliveryDiscount: cart.deliveryCost,
      overRangeCharge: overRangeTotal,
      groupDiscount: groupDiscount,
      tips: tips,
      tax: tax,
      total: productTotal + tax + tips - groupDiscount + overRangeTotal
    };
  }

  changeContact() {
    // this.router.navigate(['contact/list']);
  }

  // isPrepaidClient(account: IAccount) {
  //   return account && account.roles && account.roles.length > 0
  //     && account.roles.indexOf(Role.PREPAID_CLIENT) !== -1;
  // }

  getCost(items: any[]) {
    let cost = 0;
    let price = 0;
    items.map(x => {
      cost += (x.cost * x.quantity);
      price += (x.price * x.quantity);
    });
    return { cost: cost, price: price };
  }

  // delivery --- only need 'origin' and 'dateType' fields
  createOrder(account: IAccount, contact: IContact, cart: ICart, delivery: IDelivery, charge: ICharge, note: string,
    paymentMethod: string): IOrder {

    const items: OrderItem[] = cart.items.filter(x => x.merchantId === cart.merchantId).map(it => {
      return {
        productId: it.productId,
        quantity: it.quantity,
        price: it.price,
        cost: it.cost
      };
    });

    const summary = this.getCost(items);

    const order: IOrder = {
      clientId: contact.accountId,
      clientName: contact.username,
      defaultPickupTime: account.pickup,
      merchantId: cart.merchantId,
      merchantName: cart.merchantName,
      items: items,
      price: Math.round(summary.price * 100) / 100,
      cost: Math.round(summary.cost * 100) / 100,

      address: this.locationSvc.getAddrString(delivery.origin),
      location: delivery.origin, // fix me!!!
      note: note,
      deliveryCost: Math.round(charge.deliveryCost * 100) / 100,
      deliveryDiscount: Math.round(charge.deliveryDiscount * 100) / 100,
      groupDiscount: Math.round(charge.groupDiscount * 100) / 100,
      overRangeCharge: Math.round(charge.overRangeCharge * 100) / 100,
      total: Math.round(charge.total * 100) / 100,
      tax: Math.round(charge.tax * 100) / 100,
      tips: Math.round(charge.tips * 100) / 100,
      type: OrderType.FOOD_DELIVERY,
      status: 'new',
      driverId: '',
      paymentMethod: paymentMethod,
      dateType: delivery.dateType // this.sharedSvc.getDateType(delivery.date)
    };

    return order;
  }

  pay() {
    const contact = this.contact;
    const account = this.account;
    const charge = this.charge;
    const delivery = this.delivery;
    const cart = this.cart;
    const paymentMethod = this.paymentMethod;
    this.doPay(contact, account, charge, cart, delivery, paymentMethod);
  }

  doPay(contact: IContact, account: IAccount, charge: ICharge, cart: ICart, delivery: IDelivery, paymentMethod: string) {
    const self = this;
    if (!contact || !contact.phone || !contact.verified) {
      this.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'order-form' } });
      return;
    }

    if (!(account && delivery && delivery.date && delivery.origin)) {
      alert('缺少电话或地址');
      return;
    }

    if (this.bSubmitted) {
      this.snackBar.open('', '无法重复提交订单', { duration: 1000 });
      return;
    }

    if (!(cart && cart.items && cart.items.length > 0)) {
      alert('购物车是空的');
      return;
    }

    if (!cart.merchantId) {
      alert('没有选择商家');
      return;
    }

    this.bSubmitted = true;
    const v = this.form.value;
    const order = self.createOrder(account, contact, cart, delivery, charge, v.note, paymentMethod);

    if (paymentMethod === 'card') {
      this.paymentSvc.vaildateCardPay(this.stripe, this.card, 'card-errors').then((ret: any) => {
        self.loading = false;
        if (ret.status === 'failed') {
          self.bSubmitted = false;
        } else {
          self.handleCardPayment(account, ret.token, order, cart);
        }
      });
    } else if (paymentMethod === 'cash' || paymentMethod === 'prepaid') {
      self.handleWithCash(account, order, cart);
    } else { // wechat, alipay
      self.loading = false;
      self.handleSnappayPayment(account, order, cart);
    }
  }

  handleCardPayment(account: IAccount, token: any, order: IOrder, cart: ICart) {
    const self = this;
    const balance: number = account.balance;
    const payable = Math.round((order.total - balance) * 100) / 100;
    order.status = 'tmp'; // create a temporary order

    this.accountSvc.update({ _id: account._id }, { type: 'client' }).pipe(takeUntil(self.onDestroy$)).subscribe(ret => {

    });
    // save order and update balance
    self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((ret: IOrder) => {
      const orderId = ret._id;
      const merchantId = ret.merchantId;
      const items: ICartItem[] = cart.items.filter(x => x.merchantId === merchantId);

      self.paymentSvc.stripePayOrder(orderId, payable, token).pipe(takeUntil(self.onDestroy$)).subscribe((ch: any) => {
        self.bSubmitted = false;
        self.loading = false;
        if (ch.status === 'succeeded') {
          self.snackBar.open('', '已成功付款', { duration: 1800 });
          self.snackBar.open('', '已成功下单', { duration: 2000 });
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } }); // should be clear cart ?
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
          self.router.navigate(['order/history']);
        } else {
          self.snackBar.open('', '付款未成功', { duration: 1800 });
          alert('付款未成功，请联系客服');
        }
      });
    }, err => {
      self.snackBar.open('', '您的订单未登记成功，请重新下单。', { duration: 1800 });
    });
  }

  handleSnappayPayment(account: IAccount, order: IOrder, cart: ICart) {
    const self = this;
    const balance: number = account.balance;
    const payable = Math.round((order.total - balance) * 100) / 100;
    order.status = 'tmp'; // create a temporary order

    this.accountSvc.update({ _id: account._id }, { type: 'client' }).pipe(takeUntil(self.onDestroy$)).subscribe(ret => {

    });
    // save order and update balance
    self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((ret: IOrder) => {
      const merchantId = ret.merchantId;
      const items: ICartItem[] = cart.items.filter(x => x.merchantId === merchantId);

      // if (paymentMethod === 'WECHATPAY' || paymentMethod === 'ALIPAY') {
      self.loading = false;
      this.paymentSvc.snappayPayOrder(ret, payable).pipe(takeUntil(self.onDestroy$)).subscribe((r) => {

        // this.msg = r.msg;
        // this.log = r.data[0].trans_no;

        self.bSubmitted = false;
        if (r.msg === 'success') {
          // self.snackBar.open('', '已成功付款', { duration: 1800 });
          // self.snackBar.open('', '已成功下单', { duration: 2000 });
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
          this.loading = true;
          window.location.href = r.data[0].h5pay_url;
        } else {
          self.loading = false;
          self.snackBar.open('', '付款未成功', { duration: 1800 });
          alert('付款未成功，请联系客服');
        }
      });
    }, err => {
      self.snackBar.open('', '您的订单未登记成功，请重新下单。', { duration: 1800 });
    });
  }

  // only happend on balance < order.total
  handleWithCash(account: IAccount, order: IOrder, cart: ICart) {
    const self = this;
    const balance: number = account.balance;
    // const dateType = delivery.dateType;
    this.accountSvc.update({ _id: account._id }, { type: 'client' }).pipe(takeUntil(self.onDestroy$)).subscribe(ret => {

    });
    if (order && order._id) { // modify order, now do not support
      if (order) {
        const orderId = order._id;

        self.orderSvc.update({ _id: orderId }, order).pipe(takeUntil(this.onDestroy$)).subscribe((r: IOrder) => {
          const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === r.merchantId);
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
          self.snackBar.open('', '您的订单已经成功修改。', { duration: 2000 });
          self.bSubmitted = false;
          self.loading = false;
          self.router.navigate(['order/history']);
        }, err => {
          self.snackBar.open('', '您的订单未更改成功，请重新更改。', { duration: 1800 });
        });
      } else {
        this.snackBar.open('', '登录已过期，请重新从公众号进入', { duration: 1800 });
      }
    } else { // create new
      if (order) {
        if (balance >= order.total) {
          order.status = 'paid';
        }

        self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((orderCreated: IOrder) => {
          self.snackBar.open('', '订单已成功保存', { duration: 1800 });
          const items: ICartItem[] = cart.items.filter(x => x.merchantId === order.merchantId);
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });

          // adjust group discount
          // const clientId = order.clientId;
          // const address = order.address;
          // const merchantId = order.merchantId;

          // self.paymentSvc.addGroupDiscount(clientId, merchantId, dateType, address).pipe(takeUntil(self.onDestroy$)).subscribe(r => {
          self.bSubmitted = false;
          self.loading = false;
          self.router.navigate(['order/history']);
          // });
        }, err => {
          self.snackBar.open('', '您的订单未登记成功，请重新下单。', { duration: 1800 });
        });
      } else {
        self.bSubmitted = false;
        self.snackBar.open('', '登录已过期，请重新从公众号进入', { duration: 1800 });
      }
    } // end of create new
  }


  onSelectPaymentMethod(e) {
    const self = this;
    this.paymentMethod = e.value;
    this.rx.dispatch({
      type: OrderActions.UPDATE_PAYMENT_METHOD,
      payload: { paymentMethod: this.paymentMethod }
    });
    if (e.value === 'cash') {
      // product
    } else if (e.value === 'card') {
      const contact = this.contact;
      if (contact && contact.phone && contact.verified) {
        setTimeout(() => {
          const rt = self.paymentSvc.initStripe('card-element', 'card-errors');
          self.stripe = rt.stripe;
          self.card = rt.card;
        }, 500);
      } else {
        this.bSubmitted = true;
        this.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'order-form' } });
      }
    } else {
      // pass
    }
  }
}
