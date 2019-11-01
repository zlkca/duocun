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
import { IOrder, IOrderItem, ICharge, OrderItem } from '../order.model';
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
import { IRestaurant } from '../../restaurant/restaurant.model';
import { SharedService } from '../../shared/shared.service';

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
    private sharedSvc: SharedService,
    private locationSvc: LocationService,
    private clientBalanceSvc: BalanceService,
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

    this.rx.select('account').pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      self.account = account;
    });

    // load delivery date and location
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
    const account: IAccount = this.account;
    const accountId = this.account._id;
    const cart: ICart = this.cart;
    const order: IOrder = this.order;
    // const bNewOrder = (order && order._id) ? false : true;

    this.clientBalanceSvc.quickFind({ accountId: account._id }).pipe(takeUntil(self.onDestroy$)).subscribe((bs: IBalance[]) => {
      if (bs && bs.length > 0) {
        self.balance = bs[0];
      } else {
        self.balance = null; // should never go here
      }
    });

    // fix me
    if (cart) {
      this.merchantSvc.find({ _id: cart.merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe((ms: IRestaurant[]) => {
        const merchant: IRestaurant = ms[0];
        const merchantId = merchant._id;
        const dateType = this.sharedSvc.getDateType(self.delivery.date);
        const origin = self.delivery.origin;
        const address = this.locationSvc.getAddrString(origin);

        this.orderSvc.checkGroupDiscount(accountId, merchantId, dateType, address).pipe(takeUntil(this.onDestroy$)).subscribe(bEligible => {
          const groupDiscount = bEligible ? 2 : 0;
          self.getOverRange(origin, (distance, rate) => {
            this.charge = this.getCharge(cart, merchant, self.delivery, (distance * rate), groupDiscount);
            this.afterGroupDiscount = Math.round((!groupDiscount ? this.charge.total : (this.charge.total - 2)) * 100) / 100;
            self.loading = false;
            self.groupDiscount = groupDiscount;
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

  getCharge(cart, merchant, delivery, overRangeCharge, groupDiscount) {
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

    // fix me !!!
    // const endTime = +(merchant.endTime.split(':')[0]);

    // if (endTime < 12) {
    //   deliveryDate = delivery.date.set({ hour: 11, minute: 45, second: 0, millisecond: 0 });
    // } else {
    //   deliveryDate = delivery.date.set({ hour: 14, minute: 0, second: 0, millisecond: 0 });
    // }
    deliveryDate = delivery.date.set({ hour: 11, minute: 45, second: 0, millisecond: 0 });

    // const bNewOrder = (this.order && this.order.id) ? false : true;
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

  createOrder(balance: IBalance, contact: IContact, cart: ICart, delivery: IDelivery, charge: ICharge, note: string): IOrder {
    const self = this;
    const account = this.account;
    if (cart && cart.items && cart.items.length > 0) {
      const items: OrderItem[] = cart.items.filter(x => x.merchantId === cart.merchantId).map(it => {
        return {
          productId: it.productId,
          quantity: it.quantity,
          price: it.price,
          cost: it.cost
        };
      });

      const summary = this.getCost(items);
      const paymentMethod = (balance.amount >= charge.total) ? 'prepaid' : self.paymentMethod;

      const order: IOrder = {
        clientId: contact.accountId,
        clientName: contact.username,
        defaultPickupTime: account.pickupTime,
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
        status: 'new',
        driverId: '',
        paymentMethod: paymentMethod,

        // created: moment().toISOString(),
        deliveryDate: this.sharedSvc.getDateType(delivery.date)
      };

      return order;
    } else {
      return null;
    }
  }

  pay() {
    const self = this;
    const balance: IBalance = self.balance;
    if (!this.contact || !this.contact.phone) {
      this.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'order-form' } });
      return;
    }

    if (!this.bSubmitted) {
      this.bSubmitted = true;
      const v = this.form.value;
      const order = self.createOrder(balance, self.contact, self.cart, self.delivery, self.charge, v.note);

      if (order.paymentMethod === 'cash' || order.paymentMethod === 'prepaid') {
        self.handleWithCash(balance, order, v.note);
      } else {
        self.loading = false;
        self.handleWithPayment(self.account, order, balance, self.paymentMethod);
      }
    } else {
      this.snackBar.open('', '无法重复提交订单', { duration: 1000 });
    }
  }

  afterCardPay(orderId, order, paid, chargeId, url?: string) {
    const self = this;
    const clientId = order.clientId;
    const clientName = order.clientName;
    const delivered = this.delivery.date.toISOString();
    const address = order.address;

    const tr: ITransaction = {
      fromId: clientId,
      fromName: clientName,
      toId: DEFAULT_ADMIN.ID,
      toName: DEFAULT_ADMIN.NAME,
      type: 'credit',
      amount: paid,
      note: 'By Card',
      created: new Date(),
      modified: new Date()
    };

    this.transactionSvc.save(tr).pipe(takeUntil(this.onDestroy$)).subscribe((t: any) => {
      this.snackBar.open('', '已保存交易', { duration: 1200 });
      const data = { status: 'paid', chargeId: chargeId, transactionId: t._id };

      self.orderSvc.update({ _id: orderId }, data).pipe(takeUntil(this.onDestroy$)).subscribe((r: IOrder) => {
        self.snackBar.open('', '您的订单已经成功修改。', { duration: 2000 });

        const merchantId = order.merchantId;
        const dateType = this.sharedSvc.getDateType(this.delivery.date);
        // update my balance and group discount
        self.paymentSvc.afterAddOrder(clientId, merchantId, dateType, address, paid).pipe(takeUntil(self.onDestroy$)).subscribe(r1 => {
          self.snackBar.open('', '余额已更新', { duration: 1800 });
          self.bSubmitted = false;
          self.loading = false;
          const its: ICartItem[] = self.cart.items.filter(x => x.merchantId === r.merchantId);
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: its } });
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
          self.router.navigate(['order/history']);
        });
      }, err => {
        self.snackBar.open('', '您的订单未更改成功，请重新更改。', { duration: 1800 });
      });
    });
  }

  // only handle balance < total
  handleWithPayment(account: IAccount, order, balance, paymentMethod) {
    const self = this;
    const payable = Math.round((order.total - balance.amount) * 100) / 100;
    order.status = 'tmp'; // create a temporary order

    // save order and update balance
    self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((ret: IOrder) => {
      const orderId = ret._id;
      const clientId = ret.clientId;
      const clientName = ret.clientName;
      if (paymentMethod === 'card') {
        self.payByCard(orderId, clientId, clientName, payable, order.merchantName).then((ch: any) => {
          if (ch.status === 'succeeded') {
            self.snackBar.open('', '已成功付款', { duration: 1800 });
            self.afterCardPay(orderId, order, payable, ch.chargeId);
          } else {
            // del order ???
            self.orderSvc.removeById(orderId).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
              self.bSubmitted = false;
              self.loading = false;
              self.snackBar.open('', '付款未成功', { duration: 1800 });

              self.paymentSvc.afterRemoveOrder(orderId).subscribe(() => {
                // self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } }); // refresh order history
                self.snackBar.open('', '余额已处理', { duration: 1000 });
                // self.router.navigate(['order/history']);
                alert('Invalid payment: ' + ch.err.type + ' ' + ch.err.code);
              });
            });
          }
        });
      } else if (paymentMethod === 'WECHATPAY' || paymentMethod === 'ALIPAY') {
        self.payBySnappay(payable, order.merchantName, orderId, clientId, clientName, paymentMethod, (r) => {
          const merchantId = order.merchantId;
          const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === merchantId);
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });

          self.bSubmitted = false;
          self.loading = false;
          if (r.msg === 'success') {
            window.location.href = r.data[0].h5pay_url;
          } else { // fix me
            self.orderSvc.removeById(orderId).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
              self.snackBar.open('', '付款未成功', { duration: 1800 });

              self.paymentSvc.afterRemoveOrder(orderId).subscribe(() => {
                // self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } }); // refresh order history
                self.snackBar.open('', '余额已处理', { duration: 1000 });
                // self.router.navigate(['order/history']);
                // alert('Invalid payment: ' + ch.err.type + ' ' + ch.err.code);
                alert('付款未成功，请联系客服');
              });
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
  handleWithCash(balance: IBalance, order, note: string) {
    const self = this;
    if (this.account && this.delivery && this.delivery.date && this.delivery.origin) {
      if (this.order && this.order.id) { // modify order
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
            const paid = (balance.amount > 0) ? balance.amount : 0;
            const clientId = order.clientId;
            const merchantId = order.merchantId;
            const dateType = this.sharedSvc.getDateType(this.delivery.date);
            const address = order.address;
            self.paymentSvc.afterAddOrder(clientId, merchantId, dateType, address, paid).pipe(takeUntil(self.onDestroy$)).subscribe(r => {
              self.bSubmitted = false;
              self.loading = false;
              self.router.navigate(['order/history']);
            });
          });
        } else {
          this.snackBar.open('', '登录已过期，请重新从公众号进入', { duration: 1800 });
        }
      } else { // create new
        if (order) {
          if (balance.amount >= order.total) {
            // order.payable = 0;
            order.status = 'paid';
          } else {
            // order.payable = order.total - balance.amount;
          }

          // save order and update balance
          self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((orderCreated: IOrder) => {
            self.snackBar.open('', '订单已成功保存', { duration: 1800 });
            const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === order.merchantId);
            self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });

            // adjust group discount
            const clientId = order.clientId;
            const dateType = self.sharedSvc.getDateType(self.delivery.date); // .toISOString();
            const address = order.address;
            const merchantId = order.merchantId;

            self.paymentSvc.addGroupDiscount(clientId, merchantId, dateType, address).pipe(takeUntil(self.onDestroy$)).subscribe(r => {
              self.bSubmitted = false;
              self.loading = false;
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


  updateOrder(orderId: string, updated: any, updateCb?: any) {
    const self = this;
    self.orderSvc.update({ _id: orderId }, updated).pipe(takeUntil(this.onDestroy$)).subscribe((r: IOrder) => {
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

  payByCard(orderId: string, clientId: string, clientName: string, amount, merchantName) {
    const self = this;

    return new Promise((resolve, reject) => {
      this.stripe.createToken(this.card).then(function (result) {
        if (result.error) {
          // Inform the user if there was an error.
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
          resolve({ status: 'failed', chargeId: '', msg: result.error.message });
        } else {
          // if (!account.stripeCustomerId) {
          //   self.paymentSvc.stripeCreateCustomer(result.token.id, account.id, account.username, account.phone).
          //     pipe(takeUntil(self.onDestroy$)).subscribe(ret1 => {
          //     self.accountSvc.update({id: account.id}, {stripeCustomerId: ret1.customerId})
          //       .pipe(takeUntil(self.onDestroy$)).subscribe(ret2 => {
          //       self.paymentSvc.stripeCharge(ret1.customerId, amount, merchantName, result.token)
          //         .pipe(takeUntil(self.onDestroy$)).subscribe(ret => {
          //         self.loading = true;
          //         cb(ret);
          //       });
          //     });
          //   });
          // } else {
          // account.stripeCustomerId
          self.paymentSvc.stripeCharge(orderId, clientId, clientName, amount, merchantName, result.token)
          .pipe(takeUntil(self.onDestroy$)).subscribe(ret => {
            self.loading = true;
            resolve(ret);
          });
          // }
        }
      });
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
