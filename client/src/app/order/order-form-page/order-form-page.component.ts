import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Subject, forkJoin } from '../../../../node_modules/rxjs';
import { takeUntil, first } from '../../../../node_modules/rxjs/operators';
import { ICart } from '../../cart/cart.model';
import { IMall } from '../../mall/mall.model';
import { IContact } from '../../contact/contact.model';
import { Router } from '../../../../node_modules/@angular/router';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { OrderService } from '../order.service';
import { IOrder } from '../order.model';
import { CartActions } from '../../cart/cart.actions';
import { PageActions } from '../../main/main.actions';
import { AmountActions } from '../order.actions';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { ICommand } from '../../shared/command.reducers';
import { MatSnackBar } from '../../../../node_modules/@angular/material';

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

  constructor(
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private orderSvc: OrderService,
    private snackBar: MatSnackBar
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
    ).subscribe((x: ICommand) => {
      if (x.name === 'pay') {
        this.pay();
      }
    });

    this.rx.select('restaurant').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x: IRestaurant) => {
      this.restaurant = x;
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
        this.fullDeliveryFee = Math.ceil(malls[0].fullDeliverFee * 100) / 100;
        this.deliveryFee = Math.ceil(malls[0].deliverFee * 100) / 100; // fix me
        this.deliveryDiscount = this.fullDeliveryFee - this.deliveryFee;
      }
      this.productTotal = 0;
      this.quantity = 0;
      this.cart = cart;
      const items = this.cart.items;
      if (items && items.length > 0) {
        items.map(x => {
          this.productTotal += x.price * x.quantity;
          this.quantity += x.quantity;
        });
      }
      this.subtotal = this.productTotal + this.fullDeliveryFee;
      this.tax = Math.ceil(this.subtotal * 13) / 100;
      this.subtotal = this.subtotal + this.tax;
      this.total = this.subtotal - this.deliveryDiscount + this.tips;

      this.rx.dispatch({ type: AmountActions.UPDATE, payload: {total: this.total}});
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
    const items = this.cart ? this.cart.items : [];
    const contact = this.contact;

    if (items && items.length > 0) {
      const ids = items.map(x => x.restaurantId);
      const restaurantIds = ids.filter((val, i, a) => a.indexOf(val) === i);

      for (const id of restaurantIds) {
        orders.push({
          restaurantId: id,
          items: [],
          clientId: contact.accountId,
          username: contact.username,
          created: new Date(),
          delivered: '', // this.getDateTime(v.date, v.time),
          address: this.contact.address,
          notes: v.notes,
          restaurant: self.restaurant,
          deliverFee: self.deliveryFee,
          deliveryDiscount: self.deliveryDiscount,
          total: self.total,
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
        this.snackBar.open('', '您的订单已经成功提交。', {
          duration: 1000
        }); // Fix me
       this.router.navigate(['home']);
      });
    }
  }
}
