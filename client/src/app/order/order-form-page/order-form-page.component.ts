import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Subject, forkJoin } from '../../../../node_modules/rxjs';
import { takeUntil, first } from '../../../../node_modules/rxjs/operators';
import { IDelivery } from '../../delivery/delivery.model';
import { ICart } from '../../cart/cart.model';
import { IMall } from '../../mall/mall.model';
import { IContact } from '../../contact/contact.model';
import { Router } from '../../../../node_modules/@angular/router';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { OrderService } from '../order.service';
import { IOrder } from '../order.model';
import { CartActions } from '../../cart/cart.actions';
import { PageActions } from '../../main/main.actions';

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
  quantity;
  total = 0;
  restaurantName = '';
  tips = 3;
  malls: IMall[] = [];
  deliveryFee = 0;
  tax = 0;
  contact;
  form;

  constructor(
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private orderSvc: OrderService
  ) {
    this.form = this.fb.group({
      notes: ['']
    });

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'order-confirm'
    });

    this.rx.select('cmd').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(x => {
      if (x === 'pay') {
        this.pay();
      }
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
      )
    ]).subscribe(vals => {
      const malls = vals[0];
      const cart = vals[1];
      this.contact = vals[2];
      if (malls && malls.length > 0) {
        this.malls = malls;
        this.deliveryFee = Math.ceil(malls[0].deliverFee * 100) / 100; // fix me
      }
      this.subtotal = 0;
      this.quantity = 0;
      this.cart = cart;
      const items = this.cart.items;
      if (items && items.length > 0) {
        items.map(x => {
          this.subtotal += x.price * x.quantity;
          this.quantity += x.quantity;
        });
        this.restaurantName = items[0].restaurantName;
      }

      this.total = this.subtotal + this.deliveryFee + this.tips;
      this.tax = Math.ceil(this.total * 13) / 100;
      this.total = this.total + this.tax;
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
    return new Date(d.year, d.month - 1, d.day, t.hour, t.minute);
  }

  createOrders() {
    const self = this;
    const orders: any[] = []; // fix me
    const v = this.form.value;
    const items = this.cart.items;
    const account = this.contact.account;

    if (items && items.length > 0) {
      const ids = items.map(x => x.restaurantId);
      const restaurantIds = ids.filter((val, i, a) => a.indexOf(val) === i);

      for (const id of restaurantIds) {
        orders.push({
          restaurantId: id,
          items: [],
          clientId: account.id,
          username: account.username,
          created: new Date(),
          delivered: '', // this.getDateTime(v.date, v.time),
          address: this.contact.address,
          notes: v.notes,
          status: 'new',
          clientStatus: 'new',
          workerStatus: 'new',
          restaurantStatus: 'new',
          workerId: self.malls[0].workers[0] ? self.malls[0].workers[0].id : null // fix me
        });
      }

      for (const item of items) {
        for (const order of orders) {
          if (item.restaurantId === order.restaurantId) {
            order.items.push({
              name: item.productName,
              price: item.price,
              quantity: item.quantity,
              productId: item.productId
            });
          }
        }
      }
    }

    return orders;
  }

  pay() {
    const orders = this.createOrders();
    const self = this;
    if (orders && orders.length > 0) {
      self.orderSvc.save(orders[0]).subscribe((order: IOrder) => {
        // self.afterSubmit.emit(order);
        this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: {} });
        // this.toastSvc.success('Save Restaurant Successfully!', '', { timeOut: 2000, positionClass: 'toast-bottom-right' });
        this.router.navigate(['home']);
      });
    }
  }
}
