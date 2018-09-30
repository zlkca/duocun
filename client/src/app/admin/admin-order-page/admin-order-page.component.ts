
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
  @Input() account;

  selectedRange = 'daily';

  constructor(
    private sharedSvc: SharedService,
    private orderSvc: OrderService) { }

  ngOnInit() {
    this.onFilterOrders('daily');
  }

  add() {
    this.order = new Order();
    this.order.id = null;
    this.order.accountId = null;
    this.order.restaurantId = null;
    this.order.status = '';
  }

  onAfterSave(event) {
    this.onFilterOrders('daily');
  }

  onAfterDelete(event) {
    this.onFilterOrders('daily');
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

  loadOrders(account, start, end) {
    const self = this;
    const restaurant_id = account.restaurants[0] ? account.restaurants[0].id : null;

    if (account.type === 'user') {
      self.orderSvc.find({
        where: { and: [{accountId: account.id}, { delivered: { gt: new Date(start) } }, { delivered: { lt: new Date(end) } }] },
        include: ['account', { items: { product: 'pictures' } }, 'restaurant']
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    } else if (account.type === 'business') {
      self.orderSvc.find({
        where: { and: [{restaurantId: this.restaurantId}, { delivered: { gt: new Date(start) } }, { delivered: { lt: new Date(end) } }] },
        include: ['account', { items: { product: 'pictures' } }, 'restaurant']
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    } else if (account.type === 'deliver') {
      self.orderSvc.find({
        where: { and: [{ delivered: { gt: new Date(start) } }, { delivered: { lt: new Date(end) } }] },
        include: ['account', { items: { product: 'pictures' } }, 'restaurant']
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    } else if (account.type === 'super') {
      self.orderSvc.find({
        where: { and: [{ delivered: { gt: new Date(start) } }, { delivered: { lt: new Date(end) } }] },
        include: ['account', { items: { product: 'pictures' } }, 'restaurant']
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    }

  }

  onFilterOrders(s) {
    const self = this;
    this.selectedRange = s;

    if (s === 'daily') {
      const start = this.sharedSvc.getToday();
      const end = this.sharedSvc.getTomorrow();
      this.loadOrders(this.account, start, end);
    } else if (s === 'weekly') {
      const start = this.sharedSvc.getMonday();
      const end = this.sharedSvc.getNextMonday();
      this.loadOrders(this.account, start, end);
    } else if (s === 'monthly') {
      const start = this.sharedSvc.getFirstDayOfMonth();
      const end = this.sharedSvc.getLastDayOfMonth();
      this.loadOrders(this.account, start, end);
    } else { // all
      self.orderSvc.find({
        include: ['account', { items: { product: 'pictures' } }, 'restaurant']
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    }
  }

}
