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
  tips = 3;
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
    this.rx.select('delivery').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x: IDelivery) => {
      self.delivery = x;
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
    this.rx.select<IContact>('contact').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(x => {
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

  changeContact() {
    // this.router.navigate(['contact/list']);
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
        merchantId: cart.merchantId,
        merchantName: cart.merchantName,
        items: items,
        created: new Date(),
        delivered: this.delivery.fromTime,
        address: this.contact.address,
        location: this.contact.location,
        note: note,
        deliveryCost: self.deliveryCost,
        deliveryFee: self.deliveryFee,
        deliveryDiscount: self.deliveryDiscount,
        total: self.total,
        status: 'new',
        stuffId: '' // self.malls[0].workers[0] ? self.malls[0].workers[0].id : null // fix me
      };
      return order;
    } else {
      return null;
    }
  }

  pay() {
    const self = this;
    if (this.account && this.delivery && this.delivery.fromTime && this.contact.address && this.contact.phone) {
      const v = this.form.value;
      const cart = this.cart;
      if (this.order && this.order.id) {
        const order = this.createOrder(this.contact, v.note);
        order.id = this.order.id;
        order.created = this.order.created;
        if (order) {
          self.orderSvc.replace(order).pipe(
            takeUntil(this.onDestroy$)
          ).subscribe((r: IOrder) => {
            // self.afterSubmit.emit(order);
            const items: ICartItem[] = this.cart.items.filter(x => x.merchantId === cart.merchantId);
            self.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: {items: items} });
            self.rx.dispatch({ type: OrderActions.CLEAR, payload: {} });
            self.snackBar.open('', '您的订单已经成功修改。', {
              duration: 1800
            }); // Fix me
            if (this.contact.location) {
              this.router.navigate(['main/filter']);
            } else {
              this.router.navigate(['main/home']);
            }
          });
        } else {
          this.snackBar.open('', '登录已过期，请重新从公众号进入', {
            duration: 1800
          });
        }
      } else {
        const order = this.createOrder(this.contact, v.note);
        if (order) {
          self.orderSvc.save(order).pipe(
            takeUntil(this.onDestroy$)
          ).subscribe((r: IOrder) => {
            // self.afterSubmit.emit(order);
            const items: ICartItem[] = this.cart.items.filter(x => x.merchantId === cart.merchantId);
            this.rx.dispatch({ type: CartActions.REMOVE_FROM_CART, payload: {items: items} });
            this.snackBar.open('', '您的订单已经成功提交。', {
              duration: 1800
            }); // Fix me
            if (this.contact.location) {
              this.router.navigate(['main/filter']);
            } else {
              this.router.navigate(['main/home']);
            }
          });
        } else {
          this.snackBar.open('', '登录已过期，请重新从公众号进入', {
            duration: 1800
          });
        }
      }
    }
  }
}
