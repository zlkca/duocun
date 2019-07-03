import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { ICart, ICartItem } from '../../cart/cart.model';
import { IMall } from '../../mall/mall.model';
import { IContact } from '../../contact/contact.model';
import { Router } from '../../../../node_modules/@angular/router';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { OrderService } from '../order.service';
import { IOrder, IOrderItem } from '../order.model';
import { CartActions } from '../../cart/cart.actions';
import { PageActions } from '../../main/main.actions';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { IDeliveryTime, IDelivery } from '../../delivery/delivery.model';
import { OrderActions } from '../order.actions';
import { IAccount, Role } from '../../account/account.model';
import { LocationService } from '../../location/location.service';
import { BalanceService } from '../../payment/balance.service';
import { IBalance, IClientPayment } from '../../payment/payment.model';
import { PaymentService } from '../../payment/payment.service';
import { ILocation } from '../../location/location.model';
import { OrderSequenceService } from '../order-sequence.service';

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
  deliveryCost = 0;
  deliveryDiscount = 0;
  deliveryFee = 0;
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

  constructor(
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private orderSvc: OrderService,
    private sequenceSvc: OrderSequenceService,
    private locationSvc: LocationService,
    private balanceSvc: BalanceService,
    private paymentSvc: PaymentService,
    private snackBar: MatSnackBar
  ) {
    const self = this;
    this.form = this.fb.group({
      note: ['']
    });

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'order-confirm'
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      self.delivery = x;
      self.address = this.locationSvc.getAddrString(x.origin);
    });

    this.rx.select('account').pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      this.account = account;
      this.balanceSvc.find({ where: { accountId: account.id } }).pipe(takeUntil(this.onDestroy$)).subscribe((bs: IBalance[]) => {
        if (bs && bs.length > 0) {
          this.balance = bs[0];
        }
      });
    });

    this.rx.select('order').pipe(takeUntil(this.onDestroy$)).subscribe((order: IOrder) => {
      this.order = order;
      this.reloadGroupDiscount(self.delivery.fromTime, self.address);
    });

    this.rx.select<IContact>('contact').pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      self.contact = x;
    });
  }

  ngOnInit() {
    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.deliveryCost = cart.deliveryCost;
      this.deliveryFee = cart.deliveryFee;
      this.deliveryDiscount = cart.deliveryDiscount;
      this.productTotal = 0;
      this.items = [];

      const items: ICartItem[] = cart.items;
      if (items && items.length > 0) {
        items.map(x => {
          this.productTotal += x.price * x.quantity;
          this.items.push(x);
        });
      }
      this.subtotal = this.productTotal + this.deliveryCost;
      this.tips = 0; // this.subtotal * 0.05;
      this.tax = Math.ceil(this.subtotal * 13) / 100;
      this.subtotal = this.subtotal + this.tax;
      this.total = this.subtotal - this.deliveryDiscount + this.tips;
      this.cart = cart;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  // for display purpose, update price should be run on backend
  reloadGroupDiscount(date: Date, address: string) {
    this.orderSvc.find({ delivered: date, address: address }).pipe(takeUntil(this.onDestroy$)).subscribe(orders => {
      if (this.order && this.order.id) {
        this.groupDiscount = this.getGroupDiscount(orders, false);
      } else {
        this.groupDiscount = this.getGroupDiscount(orders, true);
      }
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

  createOrder(contact: IContact, note: string) {
    const self = this;
    const cart = this.cart;
    if (cart && cart.items && cart.items.length > 0) {
      const items: IOrderItem[] = cart.items.filter(x => x.merchantId === cart.merchantId);
      const order: IOrder = {
        clientId: contact.accountId,
        clientName: contact.username,
        clientPhoneNumber: contact.phone,
        prepaidClient: self.isPrepaidClient(this.account),
        clientBalance: this.balance ? this.balance.amount : 0,
        merchantId: cart.merchantId,
        merchantName: cart.merchantName,
        items: items,
        created: new Date(),
        delivered: this.delivery.fromTime,
        address: this.locationSvc.getAddrString(this.delivery.origin),
        location: this.delivery.origin,
        note: note,
        deliveryCost: self.deliveryCost,
        deliveryFee: self.deliveryFee,
        deliveryDiscount: self.deliveryDiscount,
        groupDiscount: self.groupDiscount,
        total: self.total - self.groupDiscount,
        tax: self.tax,
        tips: self.tips,
        status: 'new',
        driverId: ''
      };
      return order;
    } else {
      return null;
    }
  }

  getGroupDiscount(orders, bNew) {
    if (bNew) { // new order didn't insert yet
      if (orders && orders.length > 0) {
        if (orders.length >= 2) {
          return 3;
        } else {
          return orders.length + 1;
        }
      } else {
        return 0;
      }
    } else {
      if (orders && orders.length > 1) {
        if (orders.length >= 3) {
          return 3;
        } else {
          return orders.length;
        }
      } else {
        return 0;
      }
    }
  }

  pay() {
    const self = this;
    if (this.account && this.delivery && this.delivery.fromTime && this.delivery.origin) {
      const v = this.form.value;
      const cart = this.cart;
      const date = this.delivery.fromTime;
      const address = this.locationSvc.getAddrString(this.delivery.origin);

      if (this.order && this.order.id) {
        this.orderSvc.find({ delivered: date, address: address }).pipe(takeUntil(this.onDestroy$)).subscribe(orders => {
          self.groupDiscount = this.getGroupDiscount(orders, false);
          const order = this.createOrder(this.contact, v.note);
          this.sequenceSvc.find().subscribe(sq => {
            order.id = this.order.id;
            order.code = this.getCode(order.location, sq);
            order.created = this.order.created;
            if (order) { // modify
              self.orderSvc.update({id: this.order.id}, order).pipe(takeUntil(this.onDestroy$)).subscribe((r: IOrder) => {
                const items: ICartItem[] = this.cart.items.filter(x => x.merchantId === cart.merchantId);
                self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
                self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
                self.snackBar.open('', '您的订单已经成功修改。', { duration: 1800 });

                self.paymentSvc.update({ orderId: this.order.id }, { amount: order.total, type: 'debit' }).pipe(
                  takeUntil(this.onDestroy$)).subscribe(x => {
                    self.snackBar.open('', '已更新客户的余额', { duration: 1200 });
                    if (this.contact.location) {
                      this.router.navigate(['main/filter']);
                    } else {
                      this.router.navigate(['main/home']);
                    }
                  });
              });
            } else {
              this.snackBar.open('', '登录已过期，请重新从公众号进入', {
                duration: 1800
              });
            }
          });
        });
      } else { // create new

        // if (!(this.contact && this.contact.phone)) {
        //   self.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'order-form' } });
        //   return;
        // }

        this.sequenceSvc.find().pipe(takeUntil(this.onDestroy$)).subscribe(sq => {
          this.orderSvc.find({ delivered: date, address: address }).pipe(takeUntil(this.onDestroy$)).subscribe(orders => {
            self.groupDiscount = this.getGroupDiscount(orders, true);
            const order = this.createOrder(this.contact, v.note);
            order.code = this.getCode(order.location, sq);
            if (order) {
              self.orderSvc.save(order).pipe(takeUntil(this.onDestroy$)).subscribe((r: IOrder) => {
                // self.afterSubmit.emit(order);
                const items: ICartItem[] = this.cart.items.filter(x => x.merchantId === cart.merchantId);
                this.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: { items: items } });
                this.snackBar.open('', '您的订单已经成功提交。', { duration: 1800 });
                const clientPayment: IClientPayment = {
                  orderId: r.id,
                  clientId: r.clientId,
                  clientName: r.clientName,
                  driverId: '',
                  driverName: '',
                  type: 'debit',
                  amount: r.total - this.groupDiscount,
                  delivered: this.delivery.fromTime,
                  created: new Date(),
                  modified: new Date(),
                };
                this.paymentSvc.save(clientPayment).pipe(takeUntil(this.onDestroy$)).subscribe((cps: IClientPayment[]) => {
                  this.snackBar.open('', '已保存客户的余额', { duration: 1200 });
                  if (this.contact.location) {
                    this.router.navigate(['main/filter']);
                  } else {
                    this.router.navigate(['main/home']);
                  }
                });
              });
            } else {
              this.snackBar.open('', '登录已过期，请重新从公众号进入', {
                duration: 1800
              });
            }
          });
        });
      }
    }
  }
}
