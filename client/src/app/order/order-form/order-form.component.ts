import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OrderService } from '../order.service';
import { SharedService } from '../../shared/shared.service';

import { Order, Restaurant } from '../../lb-sdk';
import { FormBuilder, Validators } from '../../../../node_modules/@angular/forms';
import { environment } from '../../../environments/environment';

const APP = environment.APP;

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  @Input() account;
  @Input() items: any[];
  @Output() afterSubmit: EventEmitter<any> = new EventEmitter();
  subTotal = 0;
  total = 0;
  tax = 0;
  deliveryFee = 0;
  deliveryAddress = '';
  form;
  placeholder = 'Delivery Address';
  restaurant = null;

  constructor(
    private fb: FormBuilder,
    private sharedSvc: SharedService,
    private orderSvc: OrderService
  ) {
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

  }

  ngOnInit() {
    if (this.items && this.items.length > 0) {
      this.items.map(item => {
        this.subTotal += item.price * item.quantity;
      });

      this.orderSvc.findRestaurant(this.items[0].restaurant_id, { include: 'products' })
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
    const v = this.form.value;
    const ids = this.items.map( x => x.restaurant_id );
    const restaurantIds = ids.filter((val, i, a) => a.indexOf(val) === i);
    const orders = [];

    for (const id of restaurantIds) {
      orders.push({
        restaurantId: id,
        items: [],
        accountId: this.account.id,
        delivered: this.getDateTime(v.date, v.time),
        address: this.deliveryAddress,
        notes: v.notes
      });
    }

    for (const item of this.items) {
      for (const order of orders) {
        if (item.restaurant_id === order.restaurantId) {
          order.items.push({
            price: item.price,
            quantity: item.quantity,
            productId: item.pid,
          });
        }
      }
    }
    return orders;
  }

  checkout() {
    const orders = this.createOrders();
    const self = this;
    // orders.map(order => {
    self.orderSvc.save(orders[0]).subscribe((order: Order) => {
        self.afterSubmit.emit(orders[0]);
        // self.rx.dispatch({ type: CartActions.CLEAR_CART, payload: {} });
      });
    // });
  }
}
