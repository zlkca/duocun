
import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from '../../shared/shared.service';
import { OrderService } from '../../order/order.service';
import { Order } from '../../shared/lb-sdk';

@Component({
  selector: 'app-admin-order-page',
  templateUrl: './admin-order-page.component.html',
  styleUrls: ['./admin-order-page.component.scss']
})
export class AdminOrderPageComponent implements OnInit {
  restaurantId;
  orders: Order[] = [];
  order: Order;
  @Input() restaurant;
  selectedRange = 'daily';

  constructor(
    private sharedSvc: SharedService,
    private orderSvc: OrderService) { }

  ngOnInit() {
    this.loadOrderList();
  }

  add() {
    this.order = new Order();
    this.order.id = null;
    this.order.accountId = null;
    this.order.restaurantId = null;
    this.order.status = '';
  }

  onAfterSave(event) {
    this.loadOrderList();
  }

  onAfterDelete(event) {
    this.loadOrderList();
    if (event.order.id === this.order.id) {
      this.order = new Order();
      this.order.id = null;
      this.order.accountId = null;
      this.order.restaurantId = null;
      this.order.status = '';
    }
  }

  onSelect(event) {
    this.order = event.order;
  }

  getNextDay() {
    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();
  }

  loadOrders(start, end) {
    const self = this;
    self.orderSvc.find({
      where: { and: [{ delivered: { gt: new Date(start) } }, { delivered: { lt: new Date(end) } }] },
      include: ['account', { items: { product: 'pictures' } }, 'restaurant']
    }).subscribe((orders: Order[]) => {
      self.orders = orders;
    });
  }

  onFilterOrders(s) {
    const self = this;
    this.selectedRange = s;

    if (s === 'daily') {
      const start = this.sharedSvc.getToday();
      const end = this.sharedSvc.getTomorrow();
      this.loadOrders(start, end);

    } else if (s === 'weekly') {
      const start = this.sharedSvc.getMonday();
      const end = this.sharedSvc.getNextMonday();
      this.loadOrders(start, end);
    } else if (s === 'monthly') {
      const start = this.sharedSvc.getFirstDayOfMonth();
      const end = this.sharedSvc.getLastDayOfMonth();
      this.loadOrders(start, end);
    } else { // all
      self.orderSvc.find({
        include: ['account', { items: { product: 'pictures' } }, 'restaurant']
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    }

  }

  loadOrderList() {
    const self = this;

    if (this.restaurant) {
      self.orderSvc.find({
        where: { restaurantId: this.restaurant.id },
        include: ['account', { items: { product: 'pictures' } }, 'restaurant']
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    } else {
      this.orderSvc.find({ include: ['account', { items: { product: 'pictures' } }, 'restaurant'] }).subscribe(
        (r: Order[]) => {
          self.orders = r;
        },
        (err: any) => {
          self.orders = [];
        });
    }


    //   this.subscription = this.accountSvc.getCurrent().subscribe(account => {

    //     self.account = account;
    //     self.orderSvc.find({ where: { accountId: self.account.id },
    //         include: ['account', 'items', 'restaurant'] }).subscribe(r => {
    //         self.orders = r;
    //     });
    //     // this.subscrList.push(self.restaurantSvc.getOrders(restaurant_id, {include: ['account', {items: {product: 'pictures'}}]})
    //     // .subscribe((orders: Order[]) => {
    //     //     self.orders = orders;
    //     // }));

    //     // this.subscrList.push(self.restaurantSvc
    //     // .syncOrders(restaurant_id, {include: ['account', {items: {product: 'pictures'}}]})
    //     // .subscribe((od: Order) => {
    //     //     self.orders.push(od);
    //     // }));

    // });
  }

}
