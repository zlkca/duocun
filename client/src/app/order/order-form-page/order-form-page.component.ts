import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { ICart, ICartItem } from '../../cart/cart.model';
import { IMall } from '../../mall/mall.model';
import { IContact } from '../../contact/contact.model';
import { Router, ActivatedRoute } from '../../../../node_modules/@angular/router';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { OrderService } from '../order.service';
import { IOrder, IOrderItem, ICharge } from '../order.model';
import { CartActions } from '../../cart/cart.actions';
import { PageActions } from '../../main/main.actions';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { IDeliveryTime, IDelivery } from '../../delivery/delivery.model';
import { OrderActions } from '../order.actions';
import { IAccount, Role } from '../../account/account.model';
import { LocationService } from '../../location/location.service';
import { BalanceService } from '../../payment/balance.service';
import { IBalance, IClientPayment } from '../../payment/payment.model';
import { ILocation, IDistance, RangeRole } from '../../location/location.model';
import { OrderSequenceService } from '../order-sequence.service';
import * as moment from 'moment';
import { MerchantService } from '../../merchant/merchant.service';

import { environment } from '../../../environments/environment';
import { PaymentService } from '../../payment/payment.service';
import { ITransaction } from '../../transaction/transaction.model';
import { TransactionService } from '../../transaction/transaction.service';
import { DistanceService } from '../../location/distance.service';
import { MallService } from '../../mall/mall.service';
import { RangeService } from '../../range/range.service';
import { IRange } from '../../range/range.model';
import { ICommand } from '../../shared/command.reducers';
import { CommandActions } from '../../shared/command.actions';
import { AccountService } from '../../account/account.service';

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
  account;
  items: ICartItem[];
  order: IOrder;
  delivery: IDelivery;
  address: string;
  balance: IBalance;
  groupDiscount = 0;
  merchant;
  paymentMethod = 'cash';
  card;
  stripe;
  loading = true;

  charge: ICharge;
  afterGroupDiscount: number;
  absoluteBalance: number;
  bSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private route: ActivatedRoute,
    private mallSvc: MallService,
    private rangeSvc: RangeService,
    private orderSvc: OrderService,
    private merchantSvc: MerchantService,
    private sequenceSvc: OrderSequenceService,
    private locationSvc: LocationService,
    private balanceSvc: BalanceService,
    private paymentSvc: PaymentService,
    private distanceSvc: DistanceService,
    private transactionSvc: TransactionService,
    private snackBar: MatSnackBar
  ) {
    const self = this;

    this.form = this.fb.group({
      note: ['']
    });

    this.rx.select('account').pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      self.account = account;
      self.balanceSvc.find({ accountId: account.id }).pipe(takeUntil(self.onDestroy$)).subscribe((bs: IBalance[]) => {
        if (bs && bs.length > 0) {
          self.balance = bs[0];
          self.absoluteBalance = Math.abs(self.balance.amount);
        }
      });
    });


    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: { name: 'order-form' }
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      self.delivery = x;
      self.address = this.locationSvc.getAddrString(x.origin);
    });

    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
    });

    // for modify order
    this.rx.select('order').pipe(takeUntil(this.onDestroy$)).subscribe((order: IOrder) => {
      this.order = order;
      this.merchantSvc.find({ id: this.cart.merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe(ms => {
        const merchant = ms[0];
        if (merchant) {
          const endTime = +merchant.endTime.split(':')[0];
          if (endTime < 12) {
            self.delivery.date = self.delivery.date.set({ hour: 11, minute: 45, second: 0, millisecond: 0 });
          } else {
            self.delivery.date = self.delivery.date.set({ hour: 14, minute: 0, second: 0, millisecond: 0 });
          }
        }
        const bNewOrder = (this.order && this.order.id) ? false : true;
        this.reloadGroupDiscount(bNewOrder, self.delivery.date, self.address);
      });
    });

    this.rx.select<IContact>('contact').pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      self.contact = x;
      const fromPage = this.route.snapshot.queryParamMap.get('fromPage');
      if (fromPage === 'order-form') {
        this.pay();
      }
    });

    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'pay') {
        this.rx.dispatch({
          type: CommandActions.SEND,
          payload: { name: '' }
        });
        this.pay();
      }
    });
  }

  ngOnInit() {
    const self = this;
    const cart = this.cart;
    const bNewOrder = (this.order && this.order.id) ? false : true;
    if (cart) {
      this.merchantSvc.find({ id: cart.merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe(ms => {
        const merchant = ms[0];
        const date = this.delivery.date;
        const address = this.locationSvc.getAddrString(this.delivery.origin);
        const query = { delivered: date.toDate(), address: address, status: { $nin: ['del', 'bad'] } };

        this.orderSvc.find(query).pipe(takeUntil(this.onDestroy$)).subscribe(orders => {
          self.getOverRange(this.delivery.origin, (distance, rate) => {
            this.charge = this.getCharge(bNewOrder, orders, cart, merchant, this.delivery, (distance * rate));
            this.afterGroupDiscount = (this.charge.groupDiscount ? this.charge.total : (this.charge.total - 2));
            self.loading = false;
          });
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
    const qDist = { id: '5d671c2f6f69011d1bd42f6c' }; // TNT mall

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
              // const ms = self.updateMallInfo(rs, malls);
              // self.loadRestaurants(malls, ranges, ks);
              const r = rs[0];
              const d = (+(ds[0].element.distance.value) - r.radius * 1000) / 1000;
              const distance = d > 0 ? d : 0; // kilo meter
              if (cb) {
                cb(distance, r.overRangeRate);
              }
            }
          }, err => {
            console.log(err);
          });
        });
      }

    });
  }

  getCharge(bNewOrder, orders, cart, merchant, delivery, overRangeCharge) {
    let productTotal = 0;
    let deliveryDate;

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
    const groupDiscount = 0;
    const endTime = +(merchant.endTime.split(':')[0]);

    if (endTime < 12) {
      deliveryDate = delivery.date.set({ hour: 11, minute: 45, second: 0, millisecond: 0 });
    } else {
      deliveryDate = delivery.date.set({ hour: 14, minute: 0, second: 0, millisecond: 0 });
    }

    // const bNewOrder = (this.order && this.order.id) ? false : true;
    const overRangeTotal = Math.round(overRangeCharge * 100) / 100;
    return {
      productTotal: productTotal,
      deliveryCost: cart.deliveryCost,
      deliveryDiscount: cart.deliveryCost,
      overRangeCharge: overRangeTotal,
      groupDiscount: this.orderSvc.getGroupDiscount(orders, bNewOrder),
      tips: tips,
      tax: tax,
      total: productTotal + tax + tips - groupDiscount + overRangeTotal
    };
  }


  // for display purpose, update price should be run on backend
  reloadGroupDiscount(bNewOrder, date: any, address: string) { // date --- moment object
    const query = { delivered: date.toDate(), address: address, status: { $nin: ['del', 'bad'] } };
    this.orderSvc.find(query).pipe(takeUntil(this.onDestroy$)).subscribe(orders => {
      // fix me update group discount to order
      this.groupDiscount = this.orderSvc.getGroupDiscount(orders, bNewOrder);
    });
  }

  changeContact() {
    // this.router.navigate(['contact/list']);
  }

  isPrepaidClient(account: IAccount) {
    return account && account.roles && account.roles.length > 0
      && account.roles.indexOf(Role.PREPAID_CLIENT) !== -1;
  }

  getCode(location: ILocation, n) {
    const regionName = location.subLocality ? location.subLocality : location.city;
    const index = n > 9 ? ('' + n) : ('0' + n);
    const streetName = location.streetName.toUpperCase();
    const streetNumber = Number(location.streetNumber);
    const streetNum = streetNumber ? (streetNumber > 9 ? ('' + streetNumber) : ('00' + streetNumber)) : '00';
    return regionName.charAt(0).toUpperCase() + index.substring(0, 2) + streetName.substring(0, 1) + streetNum;
  }

  createOrder(account: IAccount, contact: IContact, cart: ICart, delivery: IDelivery, charge: ICharge, code: string, note: string) {
    const self = this;
    if (cart && cart.items && cart.items.length > 0) {
      const items: IOrderItem[] = cart.items.filter(x => x.merchantId === cart.merchantId);
      const order: IOrder = {
        code: code,
        clientId: contact.accountId,
        clientName: contact.username,
        clientPhoneNumber: contact.phone,
        prepaidClient: self.isPrepaidClient(account),
        merchantId: cart.merchantId,
        merchantName: cart.merchantName,
        items: items,
        created: new Date(),
        delivered: delivery.date.toDate(),
        address: this.locationSvc.getAddrString(delivery.origin),
        location: delivery.origin,
        note: note,
        deliveryCost: Math.round(charge.deliveryCost * 100) / 100,
        deliveryDiscount: Math.round(charge.deliveryDiscount * 100) / 100,
        groupDiscount: Math.round(charge.groupDiscount * 100) / 100,
        overRangeCharge: Math.round(charge.overRangeCharge * 100) / 100,
        total: Math.round(charge.total * 100) / 100,
        tax: Math.round(charge.tax * 100) / 100,
        tips: Math.round(charge.tips * 100) / 100,
        status: 'new',
        driverId: '',
        paymentMethod: self.paymentMethod
      };
      return order;
    } else {
      return null;
    }
  }

  pay() {
    const self = this;

    if (!this.contact || !this.contact.phone) {
      this.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'order-form' } });
      return;
    }

    if (!this.bSubmitted) {
      this.bSubmitted = true;
      const v = this.form.value;

      this.sequenceSvc.generate().pipe(takeUntil(self.onDestroy$)).subscribe(sq => {
        //   order.id = this.order.id;
        const code = self.getCode(self.delivery.origin, sq);
        const order = self.createOrder(self.account, self.contact, self.cart, self.delivery, self.charge, code, v.note);

        if (self.balance.amount >= order.total) {
          order.status = 'paid';
          self.saveOrder(order, (ret) => {
            self.snackBar.open('', '订单已保存', { duration: 1800 });
            const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === order.merchantId);
            self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
            const b = Math.round((self.balance.amount - order.total) * 100) / 100;
            const q = { accountId: self.account.id };
            self.balanceSvc.update(q, { amount: b }).pipe(takeUntil(self.onDestroy$)).subscribe((bs: IBalance[]) => {
              self.snackBar.open('', '余额已更新', { duration: 1800 });
              self.bSubmitted = false;
              self.loading = false;
              self.router.navigate(['order/history']);
            });
          });
        } else {
          if (self.paymentMethod === 'cash') {
            self.handleWithCash(self.balance, code, v.note);
          } else {
            self.loading = true;
            self.handleWithPayment(self.account.id, order, self.balance, self.paymentMethod);
          }
        }
      });
    } else {
      this.snackBar.open('', '无法重复提交订单', { duration: 1000 });
    }
  }

  afterPay(orderId, order, payable, chargeId, url?: string) {
    const self = this;
    self.saveTransaction(order.clientId, order.clientName, payable, (tr) => {
      const data = { status: 'paid', chargeId: chargeId, transactionId: tr.id };
      self.updateOrder(orderId, data, (ret) => {
        self.snackBar.open('', '订单已保存', { duration: 1800 });
        const q = { accountId: order.clientId };
        self.balanceSvc.update(q, { amount: 0 }).pipe(takeUntil(self.onDestroy$)).subscribe((bs: IBalance[]) => {
          self.snackBar.open('', '余额已更新', { duration: 1800 });
          self.bSubmitted = false;
          self.loading = false;

          const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === order.merchantId);
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
          self.router.navigate(['order/history']);
        });
      });
    });
  }

  // only handle balance < total
  handleWithPayment(accountId, order, balance, paymentMethod) {
    const self = this;
    const payable = Math.round((order.total - balance.amount) * 100) / 100;
    order.status = 'del'; // create a temporary order

    self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((ret: IOrder) => {
      if (paymentMethod === 'card') {
        self.payByCard(payable, order.merchantName, (ch) => {
          if (ch.status === 'succeeded') {
            self.snackBar.open('', '已成功付款', { duration: 1800 });
            self.afterPay(ret.id, order, payable, ch.chargeId);
          } else {
            // del order ???
            self.orderSvc.removeById(ret.id).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
            });
            self.bSubmitted = false;
            self.loading = false;
            self.snackBar.open('', '付款未成功', { duration: 1800 });
            alert('invalid card');
          }
        });
      } else if (paymentMethod === 'WECHATPAY' || paymentMethod === 'ALIPAY') {
        self.payBySnappay(payable, order.merchantName, ret.id, ret.clientId, ret.clientName, paymentMethod, (r) => {
          const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === r.merchantId);
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
          self.bSubmitted = false;
          self.loading = false;
          if (r.msg === 'success') {
            window.location.href = r.data[0].h5pay_url;
          } else { // fix me
            self.orderSvc.removeById(ret.id).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
              self.snackBar.open('', '付款未成功', { duration: 1800 });
              alert('付款未成功，请联系客服');
            });
          }
        });
      } else {
        // other payment method
      }
    }, err => {
      self.snackBar.open('', '您的订单未登记成功，请重新下单。', { duration: 1800 });
    });
  }


  // only happend on balance < order.total
  handleWithCash(balance: IBalance, code: string, note: string) {
    const self = this;

    if (this.account && this.delivery && this.delivery.date && this.delivery.origin) {

      if (this.order && this.order.id) { // modify order
        const order = this.createOrder(this.account, this.contact, this.cart, this.delivery, this.charge, code, note);
        order.id = this.order.id;
        order.created = this.order.created;
        // if (this.order.paymentMethod === 'card') {
        //   self.paymentSvc.refund(this.order.chargeId).pipe(takeUntil(this.onDestroy$)).subscribe((re) => {
        //     if (re.status === 'succeeded') {
        //       self.snackBar.open('', '已成功安排退款。', { duration: 1800 });
        //     } else {
        //       alert('退款失败，请联系客服');
        //     }
        //   });
        //   this.rmTransaction(this.order.transactionId);
        // }
        if (order) { // modify, currently never run to here
          self.updateOrder(order.id, order, (orderUpdated) => {
            self.snackBar.open('', '订单已更新', { duration: 1800 });

            // fix me
            self.balanceSvc.update({ accountId: self.account.id }, { amount: 0 }).pipe(takeUntil(self.onDestroy$)).subscribe(bs => {
              self.snackBar.open('', '余额已更新', { duration: 1800 });
              self.bSubmitted = false;
              self.router.navigate(['order/history']);
            });
          });


        } else {
          this.snackBar.open('', '登录已过期，请重新从公众号进入', { duration: 1800 });
        }
      } else { // create new
        const order: IOrder = this.createOrder(this.account, this.contact, this.cart, this.delivery, this.charge, code, note);
        if (order) {
          self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((orderCreated: IOrder) => {
            self.snackBar.open('', '订单已成功保存', { duration: 1800 });
            const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === order.merchantId);
            self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
            const newAmount = Math.round((balance.amount - order.total) * 100) / 100;
            self.balanceSvc.update({ accountId: self.account.id }, { amount: newAmount }).pipe(takeUntil(this.onDestroy$)).subscribe(bs => {
              self.snackBar.open('', '余额已更新', { duration: 1800 });
              self.bSubmitted = false;
              self.router.navigate(['order/history']);
            });
          }, err => {
            self.snackBar.open('', '您的订单未登记成功，请重新下单。', { duration: 1800 });
          });
        } else {
          self.bSubmitted = false;
          self.snackBar.open('', '登录已过期，请重新从公众号进入', { duration: 1800 });
        }
      }
    }
  }

  rmTransaction(transactionId, cb?: any) {
    this.transactionSvc.removeById(transactionId).pipe(takeUntil(this.onDestroy$)).subscribe(t => {
      this.snackBar.open('', '已删除交易', { duration: 1000 });
      if (cb) {
        cb(t);
      }
    });
  }

  updateTransaction(transactionId, order: IOrder, cb?: any) {
    const tr: ITransaction = {
      fromId: order.clientId,
      fromName: order.clientName,
      toId: DEFAULT_ADMIN.ID,
      toName: DEFAULT_ADMIN.NAME,
      type: 'credit',
      amount: order.total,
      note: 'By Card',
      created: order.delivered,
      modified: new Date()
    };
    this.transactionSvc.update({ id: transactionId }, tr).pipe(takeUntil(this.onDestroy$)).subscribe(t => {
      this.snackBar.open('', '已保存交易', { duration: 1000 });
      if (cb) {
        cb(t);
      }
    });
  }

  saveTransaction(clientId: string, clientName: string, amount: number, cb?: any) {
    const tr: ITransaction = {
      fromId: clientId,
      fromName: clientName,
      toId: DEFAULT_ADMIN.ID,
      toName: DEFAULT_ADMIN.NAME,
      type: 'credit',
      amount: amount,
      note: 'By Card',
      created: new Date(),
      modified: new Date()
    };
    this.transactionSvc.save(tr).pipe(takeUntil(this.onDestroy$)).subscribe(t => {
      this.snackBar.open('', '已保存交易', { duration: 1200 });
      if (cb) {
        cb(t);
      }
    });
  }

  updateOrder(orderId: string, updated: any, updateCb?: any) {
    const self = this;
    self.orderSvc.update({ id: orderId }, updated).pipe(takeUntil(this.onDestroy$)).subscribe((r: IOrder) => {
      const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === r.merchantId);
      self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
      self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
      self.snackBar.open('', '您的订单已经成功修改。', { duration: 2000 });
      if (updateCb) {
        updateCb(r);
      }
    }, err => {
      self.snackBar.open('', '您的订单未更改成功，请重新更改。', { duration: 1800 });
    });
  }

  saveOrder(order: IOrder, saveCb?: any) {
    const self = this;
    this.orderSvc.save(order).pipe(takeUntil(this.onDestroy$)).subscribe((r: IOrder) => {
      // self.snackBar.open('', '您的订单已经成功提交。', { duration: 2000 });
      if (saveCb) {
        saveCb(r);
      }
    }, err => {
      self.snackBar.open('', '您的订单未登记成功，请重新下单。', { duration: 1800 });
    });
  }

  onSelectPaymentMethod(e) {
    const self = this;
    this.paymentMethod = e.value;
    if (e.value === 'cash') {
      // product
    } else if (e.value === 'card') {
      setTimeout(() => {
        self.initStripe();
      }, 500);
    }
  }

  initStripe() {
    this.stripe = Stripe(environment.STRIPE.API_KEY);
    const elements = this.stripe.elements();

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
    this.card = elements.create('card', { hidePostalCode: true, style: style });

    // Add an instance of the card Element into the `card-element` <div>.
    this.card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    this.card.addEventListener('change', function (event) {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }

  payByCard(amount, merchantName, cb) {
    const self = this;
    self.loading = false;
    this.stripe.createToken(this.card).then(function (result) {
      if (result.error) {
        // Inform the user if there was an error.
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        self.paymentSvc.stripeCharge(amount, merchantName, result.token).pipe(takeUntil(self.onDestroy$)).subscribe(ret => {
          cb(ret);
        });
      }
    });
  }

  payBySnappay(amount, merchantName, orderId, clientId, clientName, paymentMethod, cb) {
    const self = this;
    self.loading = false;
    this.paymentSvc.snappayCharge(amount, merchantName, orderId, clientId, clientName, paymentMethod)
      .pipe(takeUntil(self.onDestroy$)).subscribe((ret) => {
        if (ret.msg === 'success') {
          cb(ret);
          // window.location = ret.data[0].h5pay_url; // qrcode_url;
        } else {
          cb(ret);
        }
        // if (result.error) {
        //   // // Inform the user if there was an error.
        //   // const errorElement = document.getElementById('card-errors');
        //   // errorElement.textContent = result.error.message;
        // } else {
        //   self.paymentSvc.stripeCharge(amount, merchantName, result.token).pipe(takeUntil(self.onDestroy$)).subscribe(ret => {
        //     cb(ret);
        //   });
        // }
      });
  }

}
