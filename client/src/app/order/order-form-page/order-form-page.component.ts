import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Subject, forkJoin } from '../../../../node_modules/rxjs';
import { takeUntil, first } from '../../../../node_modules/rxjs/operators';
import { ICart, ICartItem } from '../../cart/cart.model';
import { IMall } from '../../mall/mall.model';
import { IContact } from '../../contact/contact.model';
import { Router } from '../../../../node_modules/@angular/router';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { OrderService } from '../order.service';
import { IOrder, IOrderItem } from '../order.model';
import { CartActions } from '../../cart/cart.actions';
import { PageActions } from '../../main/main.actions';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { IDeliveryTime } from '../../delivery/delivery.model';
import * as moment from 'moment';
import { OrderActions } from '../order.actions';

@Component({
  selector: 'app-order-form-page',
  templateUrl: './order-form-page.component.html',
  styleUrls: ['./order-form-page.component.scss']
})
export class OrderFormPageComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<any>();
  delivery;
  cart;
  subtotal;
  total = 0;
  tips = 3;
  malls: IMall[] = [];
  productTotal = 0;
  fullDeliveryFee = 0;
  deliveryDiscount = 0;
  deliveryFee = 0;
  tax = 0;
  contact: IContact;
  restaurant: IRestaurant;
  form;
  account;
  deliveryDateTime: Date;
  items: ICartItem[];
  order: IOrder;

  constructor(
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private orderSvc: OrderService,
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

    this.rx.select('deliveryTime').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x: IDeliveryTime) => {
      self.deliveryDateTime = self.getDateTime(x.date, x.startTime);
    });
    this.rx.select('account').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: Account) => {
      this.account = account;
    });
    this.rx.select('order').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((order: IOrder) => {
      this.order = order;
    });
  }

  ngOnInit() {
    const self = this;
    forkJoin([
      this.rx.select<IMall[]>('malls').pipe(
        first(),
        takeUntil(this.onDestroy$)
      ),
      this.rx.select<ICart>('cart').pipe(
        first(),
        takeUntil(this.onDestroy$)
      ),
      this.rx.select<IContact>('contact').pipe(
        first(),
        takeUntil(this.onDestroy$)
      ),
      this.rx.select<IRestaurant>('restaurant').pipe(
        first(),
        takeUntil(this.onDestroy$)
      )
    ]).subscribe(vals => {
      const malls = vals[0];
      const cart = vals[1];
      self.contact = vals[2];
      self.restaurant = vals[3];
      if (malls && malls.length > 0) {
        this.malls = malls; // fix me
        this.fullDeliveryFee = Math.ceil(malls[0].fullDeliverFee * 100) / 100;
        this.deliveryFee = Math.ceil(malls[0].deliverFee * 100) / 100; // fix me
        this.deliveryDiscount = this.fullDeliveryFee - this.deliveryFee;
      }
      this.productTotal = 0;
      this.cart = cart;
      this.items = [];
      const items = this.cart.items;
      if (items && items.length > 0) {
        items.map(x => {
          if (x.merchantId === self.restaurant.id) {
            this.productTotal += x.price * x.quantity;
            this.items.push(x);
          }
        });
      }
      this.subtotal = this.productTotal + this.fullDeliveryFee;
      this.tax = Math.ceil(this.subtotal * 13) / 100;
      this.subtotal = this.subtotal + this.tax;
      this.total = this.subtotal - this.deliveryDiscount + this.tips;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  changeContact() {
    this.router.navigate(['contact/list']);
  }


  getDateTime(d, t) {
    const hm = t.split(':');
    const m = moment(d); // .utcOffset(0);
    return m.set({ hour: parseInt(hm[0], 10), minute: parseInt(hm[1], 10), second: 0, millisecond: 0 }).toDate();
  }

  createOrder(merchantId: string, contact: IContact, note: string) {
    const self = this;
    if (this.cart && this.cart.items && this.cart.items.length > 0) {
      const items: IOrderItem[] = this.cart.items.filter(x => x.merchantId === merchantId);
      const order: IOrder = {
        clientId: contact.accountId,
        clientName: contact.username,
        merchantId: merchantId,
        merchantName: self.restaurant.name,
        items: items,
        created: new Date(),
        delivered: this.deliveryDateTime,
        address: this.contact.address,
        note: note,
        deliveryFee: self.deliveryFee,
        deliveryDiscount: self.deliveryDiscount,
        total: self.total,
        status: 'new',
        clientStatus: 'new',
        workerStatus: 'new',
        merchantStatus: 'new',
        stuffId: '' // self.malls[0].workers[0] ? self.malls[0].workers[0].id : null // fix me
      };
      return order;
    } else {
      return null;
    }
  }

  pay() {
    const self = this;
    if (this.account) {
      const v = this.form.value;

      if (this.order && this.order.id) {
        const order = this.createOrder(this.restaurant.id, this.contact, v.note);
        order.id = this.order.id;
        order.created = this.order.created;
        if (order) {
          self.orderSvc.replace(order).pipe(
            takeUntil(this.onDestroy$)
          ).subscribe((r: IOrder) => {
            // self.afterSubmit.emit(order);
            const items: ICartItem[] = this.cart.items.filter(x => x.merchantId === this.restaurant.id);
            this.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: items });
            this.rx.dispatch({ type: OrderActions.CLEAR, payload: null });
            this.snackBar.open('', '您的订单已经成功修改。', {
              duration: 1000
            }); // Fix me
            if (this.contact.location) {
              this.router.navigate(['main/filter']);
            } else {
              this.router.navigate(['main/home']);
            }
          });
        } else {
          this.snackBar.open('', '登录已过期，请重新从公众号进入', {
            duration: 1000
          });
        }
      } else {
        const order = this.createOrder(this.restaurant.id, this.contact, v.note);
        if (order) {
          self.orderSvc.save(order).pipe(
            takeUntil(this.onDestroy$)
          ).subscribe((r: IOrder) => {
            // self.afterSubmit.emit(order);
            const items: ICartItem[] = this.cart.items.filter(x => x.merchantId === this.restaurant.id);
            this.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: items });
            this.snackBar.open('', '您的订单已经成功提交。', {
              duration: 1000
            }); // Fix me
            if (this.contact.location) {
              this.router.navigate(['main/filter']);
            } else {
              this.router.navigate(['main/home']);
            }
          });
        } else {
          this.snackBar.open('', '登录已过期，请重新从公众号进入', {
            duration: 1000
          });
        }
      }
    }
  }
}
