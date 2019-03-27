import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OrderService } from '../order.service';
import { SharedService } from '../../shared/shared.service';

import { Order, Restaurant, Account, OrderInterface } from '../../lb-sdk';
import { FormBuilder, Validators } from '../../../../node_modules/@angular/forms';
import { environment } from '../../../environments/environment';
import { ICartItem } from '../../order/order.actions';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { IMall } from '../../mall/mall.model';

const APP = environment.APP;

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  @Input() account: Account;
  @Input() items: ICartItem[];
  @Output() afterSubmit: EventEmitter<any> = new EventEmitter();
  subTotal = 0;
  total = 0;
  tax = 0;
  deliveryFee = 0;
  deliveryAddress = '';
  form;
  placeholder = 'Delivery Address';
  restaurant = null;
  mall: IMall;

  constructor(
    private fb: FormBuilder,
    private sharedSvc: SharedService,
    private orderSvc: OrderService,
    private rx: NgRedux<IAppState>
  ) {
    const self = this;
    const s = JSON.parse(localStorage.getItem('location-' + APP));
    const tomorrow = this.sharedSvc.getNextDay();
    this.form = this.fb.group({
      notes: [''],
      date: [tomorrow, [Validators.required]],
      time: [{ hour: 12, minute: 30 }, [Validators.required]],
      // address: [s, [Validators.required]]
    });

    if (s) {
      this.deliveryAddress = s.street_number + ' ' + s.street_name + ' ' + s.sub_locality + ', ' + s.province;
    }

    this.rx.select<string>('cmd').subscribe(x => {
      if (x === 'pay') {
        self.checkout();
      }
    });

    this.rx.select<IMall>('mall').subscribe(mall => {
      self.mall = mall;
    });
  }

  ngOnInit() {
    if (this.items && this.items.length > 0) {
      this.items.map(item => {
        this.subTotal += item.price * item.quantity;
      });

      this.orderSvc.findRestaurant(this.items[0].restaurantId, { include: 'products' })
        .subscribe((r: Restaurant) => {
          this.restaurant = r;
          this.deliveryFee = r.delivery_fee ? r.delivery_fee : 0;
          this.tax = (this.subTotal + this.deliveryFee) * 0.13;
          this.total = this.subTotal + this.deliveryFee + this.tax;
        });
    }

  }

  cancel() {

  }

  onAddressChange(event) {
    this.deliveryAddress = event.sAddr;
  }

  getDateTime(d, t) {
    return new Date(d.year, d.month - 1, d.day, t.hour, t.minute);
  }

  createOrders() {
    const self = this;
    const orders: any[] = []; // fix me
    const v = this.form.value;

    if (this.items && this.items.length > 0) {
      const ids = this.items.map(x => x.restaurantId);
      const restaurantIds = ids.filter((val, i, a) => a.indexOf(val) === i);

      for (const id of restaurantIds) {
        orders.push({
          restaurantId: id,
          items: [],
          clientId: this.account.id,
          username: this.account.username,
          created: new Date(),
          delivered: this.getDateTime(v.date, v.time),
          address: this.deliveryAddress,
          notes: v.notes,
          status: 'new',
          clientStatus: 'new',
          workerStatus: 'new',
          restaurantStatus: 'new',
          workerId: self.mall.workers[0] ? self.mall.workers[0].id : null
        });
      }

      for (const item of this.items) {
        for (const order of orders) {
          if (item.restaurantId === order.restaurantId) {
            order.items.push({
              name: item.name,
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

  checkout() {
    const orders = this.createOrders();
    const self = this;
    if (orders && orders.length > 0) {
      self.orderSvc.save(orders[0]).subscribe((order: Order) => {
        self.afterSubmit.emit(order);
        // self.rx.dispatch({ type: CartActions.CLEAR_CART, payload: {} });
      });
    }
  }
}
