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
import { IOrder, ICharge, OrderItem, OrderType, OrderStatus, PaymentStatus } from '../order.model';
import { CartActions } from '../../cart/cart.actions';
import { PageActions } from '../../main/main.actions';
import { MatSnackBar, MatDialog } from '../../../../node_modules/@angular/material';
import { IDelivery } from '../../delivery/delivery.model';
import { OrderActions } from '../order.actions';
import { IAccount } from '../../account/account.model';
import { LocationService } from '../../location/location.service';

import { environment } from '../../../environments/environment';
import { PaymentService } from '../../payment/payment.service';
import { RangeService } from '../../range/range.service';
import { ICommand } from '../../shared/command.reducers';
import { CommandActions } from '../../shared/command.actions';
import { AccountService } from '../../account/account.service';
import { PhoneVerifyDialogComponent } from '../phone-verify-dialog/phone-verify-dialog.component';
import { CartService } from '../../cart/cart.service';

declare var window;

@Component({
  selector: 'app-order-form-page',
  templateUrl: './order-form-page.component.html',
  styleUrls: ['./order-form-page.component.scss']
})
export class OrderFormPageComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<any>();
  cart;
  malls: IMall[] = [];
  form;
  account: IAccount;
  items: ICartItem[];
  order: IOrder; // used for identifing new order or not, now used for updating paymentMethod info
  delivery: IDelivery;
  address: string;    // for display
  balance: number;
  paymentMethod = 'cash';
  card;
  stripe;
  loading = true;
  charge: ICharge;
  afterGroupDiscount: number;
  bSubmitted = false;
  fromPage: string; // params from previous page
  action: string;   // params from previous page
  lang = environment.language;

  constructor(
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private route: ActivatedRoute,
    private rangeSvc: RangeService,
    private orderSvc: OrderService,
    private cartSvc: CartService,
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

    // for modify order and update paymentMethod field
    this.rx.select('order').pipe(takeUntil(this.onDestroy$)).subscribe((order: IOrder) => {
      this.order = order;
    });

    // ----------------------------------------------
    // trigger payment process from footer
    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'pay') {
        this.rx.dispatch({ type: CommandActions.SEND, payload: { name: '' } });

        const delivery = x.args.delivery;
        const cart = x.args.cart;
        const paymentMethod = x.args.paymentMethod;
        const origin = delivery.origin;
        const groupDiscount = 0; // bEligible ? 2 : 0;

        self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
          this.loading = false;

          if (account) {
            this.paymentMethod = paymentMethod;
            this.balance = account.balance;

            if (origin) {
              self.rangeSvc.getOverRange(origin).pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
                this.charge = this.cartSvc.getCost(cart, (r.distance * r.rate), groupDiscount);
                if (account.type === 'tmp') {
                  this.openPhoneVerifyDialog();
                } else {
                  self.doPay(account, self.charge, cart, delivery, paymentMethod);
                }
              });
            } else {
              console.log('pay command require origin');
            }
          } else {
            this.openPhoneVerifyDialog();
            // this.router.navigate(['account/phone-verify'], { queryParams: { fromPage: this.fromPage, action: 'pay' } });
          }
        });
      }
    });
  }

  ngOnInit() {
    const self = this;
    this.loading = false;

    // trigger payment from the page of phone number verification
    if (this.fromPage === 'order-form') {
      this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {

        self.account = account;
        self.balance = account.balance;
        self.loading = false;
        self.bSubmitted = false;
        const origin = self.delivery.origin;
        const groupDiscount = 0; // bEligible ? 2 : 0;
        if (origin) {
          self.rangeSvc.getOverRange(origin).pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
            self.charge = self.cartSvc.getCost(self.cart, (r.distance * r.rate), groupDiscount);
            self.paymentMethod = self.order ? self.paymentMethod : 'cash';
            self.loading = false;
            setTimeout(() => {
              if (self.paymentMethod === 'card') {
                const rt = self.paymentSvc.initStripe('card-element', 'card-errors');
                this.stripe = rt.stripe;
                this.card = rt.card;
              }

              if (this.action === 'pay') {
                self.doPay(account, this.charge, this.cart, this.delivery, this.paymentMethod);
              }

            }, 800);
          });
        } else {
          console.log('getOverRange require origin');
        }
      });
    } else { // normal procedure from restaurant detail page
      this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
        self.account = account;
        self.balance = account ? account.balance : 0;

        const cart: ICart = this.cart;

        if (cart) {
          const origin = self.delivery.origin;
          const groupDiscount = 0; // bEligible ? 2 : 0;
          if (origin) {
            self.rangeSvc.getOverRange(origin).pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
              this.charge = this.cartSvc.getCost(cart, (r.distance * r.rate), groupDiscount);
              this.paymentMethod = (self.balance >= this.charge.total) ? 'prepaid' : self.paymentMethod;
              this.rx.dispatch({
                type: OrderActions.UPDATE_PAYMENT_METHOD,
                payload: { paymentMethod: this.paymentMethod }
              });
              this.afterGroupDiscount = Math.round((!groupDiscount ? this.charge.total : (this.charge.total - 2)) * 100) / 100;
              self.loading = false;
            });
          } else {
            console.log('getOverRange need origin');
          }
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

  // delivery --- only need 'origin' and 'dateType' fields
  createOrder(account: IAccount, cart: ICart, delivery: IDelivery, charge: ICharge, note: string, paymentMethod: string): IOrder {

    const items: OrderItem[] = cart.items.filter(x => x.merchantId === cart.merchantId).map(it => {
      return {
        productId: it.productId,
        quantity: it.quantity,
        price: it.price,
        cost: it.cost
      };
    });

    const order: IOrder = {
      clientId: account._id,
      clientName: account.username,
      defaultPickupTime: account.pickup,
      merchantId: cart.merchantId,
      merchantName: cart.merchantName,
      items: items,
      price: Math.round(charge.price * 100) / 100,
      cost: Math.round(charge.cost * 100) / 100,
      // address: this.locationSvc.getAddrString(delivery.origin),
      location: delivery.origin,
      note: note,
      deliveryCost: Math.round(charge.deliveryCost * 100) / 100,
      deliveryDiscount: Math.round(charge.deliveryDiscount * 100) / 100,
      groupDiscount: Math.round(charge.groupDiscount * 100) / 100,
      overRangeCharge: Math.round(charge.overRangeCharge * 100) / 100,
      total: Math.round(charge.total * 100) / 100,
      tax: Math.round(charge.tax * 100) / 100,
      tips: Math.round(charge.tips * 100) / 100,
      type: OrderType.FOOD_DELIVERY,
      status: OrderStatus.NEW,
      paymentStatus: PaymentStatus.UNPAID,
      driverId: '',
      paymentMethod: paymentMethod,
      dateType: delivery.dateType // this.sharedSvc.getDateType(delivery.date)
    };

    return order;
  }

  pay() {
    const account = this.account;
    const charge = this.charge;
    const delivery = this.delivery;
    const cart = this.cart;
    const paymentMethod = this.paymentMethod;
    this.doPay(account, charge, cart, delivery, paymentMethod);
  }

  doPay(account: IAccount, charge: ICharge, cart: ICart, delivery: IDelivery, paymentMethod: string) {
    const self = this;
    const missingInfoHint = this.lang === 'en' ? 'Missing phone number or address' : '缺少电话或地址';
    const dupInfoHint = this.lang === 'en' ? 'Can not submit duplicated order' : '无法重复提交订单';
    const emptyCartHint = this.lang === 'en' ? 'The Shopping cart is empty' : '购物车是空的';
    if (!account || !account.phone || !account.verified) {
      this.openPhoneVerifyDialog(); // fix me
      // this.router.navigate(['account/phone-verify'], { queryParams: { fromPage: 'order-form' } });
      return;
    }

    if (!(account && delivery && delivery.origin)) {
      alert(missingInfoHint);
      return;
    }

    if (this.bSubmitted) {
      this.snackBar.open('', dupInfoHint, { duration: 1000 });
      return;
    }

    if (!(cart && cart.items && cart.items.length > 0)) {
      alert(emptyCartHint);
      return;
    }

    this.bSubmitted = true;
    const v = this.form.value;
    const order = self.createOrder(account, cart, delivery, charge, v.note, paymentMethod); // Create an unpaid order

    this.accountSvc.update({ _id: account._id }, { type: 'client' }).pipe(takeUntil(self.onDestroy$)).subscribe(ret => { });

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
    const payAlert = this.lang === 'en' ? 'Unsuccessful payment, please contact our customer service.' : '付款未成功，请联系客服';
    const payHint = this.lang === 'en' ? 'The order is placed and paid successfully' : '已成功下单';
    order.status = OrderStatus.TEMP;
    // save order and update balance
    self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((ret: IOrder) => {
      const orderId = ret._id;
      const merchantId = ret.merchantId;
      const items: ICartItem[] = cart.items.filter(x => x.merchantId === merchantId);

      self.paymentSvc.stripePayOrder(orderId, payable, token).pipe(takeUntil(self.onDestroy$)).subscribe((ch: any) => {
        self.bSubmitted = false;
        self.loading = false;
        if (ch.status === 'succeeded') {
          self.snackBar.open('', payHint, { duration: 2000 });
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } }); // should be clear cart ?
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
          self.router.navigate(['order/history']);
        } else {
          alert(payAlert);
        }
      });
    }, err => {
      self.snackBar.open('', payAlert, { duration: 1800 });
    });
  }

  handleSnappayPayment(account: IAccount, order: IOrder, cart: ICart) {
    const self = this;
    const balance: number = account.balance;
    const payable = Math.round((order.total - balance) * 100) / 100;
    const payAlert = this.lang === 'en' ? 'Unsuccessful payment, please contact our customer service.' : '付款未成功，请联系客服';


    order.status = OrderStatus.TEMP;
    // save order and update balance
    self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((ret: IOrder) => {
      const merchantId = ret.merchantId;
      const items: ICartItem[] = cart.items.filter(x => x.merchantId === merchantId);

      // if (paymentMethod === 'WECHATPAY' || paymentMethod === 'ALIPAY') {
      self.loading = false;
      this.paymentSvc.snappayPayOrder(ret, payable).pipe(takeUntil(self.onDestroy$)).subscribe((r) => {
        self.bSubmitted = false;
        if (r.msg === 'success') {
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
          // this.loading = true; should not show loading, because tencent cache page
          window.location.href = r.data[0].h5pay_url;
        } else {
          self.loading = false;
          alert(payAlert);
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
    const orderSuccessHint = this.lang === 'en' ? 'The order is placed successfully' : '已成功下单';
    const orderFailHint = this.lang === 'en' ? 'The order is placed unsuccessfully' : '下单未成功';
    if (order && order._id) { // modify order, now do not support
      if (order) {
        const orderId = order._id;

        self.orderSvc.update({ _id: orderId }, order).pipe(takeUntil(this.onDestroy$)).subscribe((r: IOrder) => {
          const items: ICartItem[] = self.cart.items.filter(x => x.merchantId === r.merchantId);
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
          self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
          self.snackBar.open('', orderSuccessHint, { duration: 2000 });
          self.bSubmitted = false;
          self.loading = false;
          self.router.navigate(['order/history']);
        }, err => {
          self.snackBar.open('', orderFailHint, { duration: 1800 });
        });
      } else {
        this.snackBar.open('', '登录已过期，请重新从公众号进入', { duration: 1800 });
      }
    } else { // create new
      if (order) {
        if (balance >= order.total) {
          order.paymentStatus = PaymentStatus.PAID;
        }

        self.orderSvc.save(order).pipe(takeUntil(self.onDestroy$)).subscribe((orderCreated: IOrder) => {
          self.snackBar.open('', orderSuccessHint, { duration: 1800 });
          const items: ICartItem[] = cart.items.filter(x => x.merchantId === order.merchantId);
          self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });

          // adjust group discount
          // const clientId = order.clientId;
          // const merchantId = order.merchantId;

          // self.paymentSvc.addGroupDiscount(clientId, merchantId, dateType, address).pipe(takeUntil(self.onDestroy$)).subscribe(r => {
          self.bSubmitted = false;
          self.loading = false;
          self.router.navigate(['order/history']);
          // });
        }, err => {
          self.snackBar.open('', orderFailHint, { duration: 1800 });
        });
      } else {
        self.bSubmitted = false;
        self.snackBar.open('', '登录已过期，请重新从公众号进入', { duration: 1800 });
      }
    } // end of create new
  }


  onSelectPaymentMethod(paymentMethod) {
    const self = this;
    this.paymentMethod = paymentMethod;
    this.rx.dispatch({
      type: OrderActions.UPDATE_PAYMENT_METHOD,
      payload: { paymentMethod: this.paymentMethod }
    });
    if (paymentMethod === 'cash') {
      // product
    } else if (paymentMethod === 'card') {
      setTimeout(() => {
        const rt = self.paymentSvc.initStripe('card-element', 'card-errors');
        self.stripe = rt.stripe;
        self.card = rt.card;
      }, 500);
    } else {
      // pass
    }
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

}
