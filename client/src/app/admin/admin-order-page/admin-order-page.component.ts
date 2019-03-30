
import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../account/auth.service';
import { SharedService } from '../../shared/shared.service';
import { OrderService } from '../../order/order.service';
import { Order } from '../../order/order.model';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../shared/socket.service';
declare var io;

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
  // socket;

  constructor(
    private sharedSvc: SharedService,
    private orderSvc: OrderService,
    private toastSvc: ToastrService,
    private authSvc: AuthService,
    private socketSvc: SocketService,
  ) {
  }

  ngOnInit() {
    const self = this;
    this.onFilterOrders('daily');
    // '[' + method + ']' + baseUrl + '/api/' + collectionName;

    // this.socket.connect(this.authSvc.getToken());
    // this.socket.on('updateOrders', x => {
    //   self.toastSvc.success('New Order Added!', '', { timeOut: 2000 });
    //   self.onFilterOrders(this.selectedRange);
    // });

    // this.socketSvc.init(this.authSvc.getAccessToken());


    // this.socket = io.connect(environment.API_BASE);
    // this.socket.on('updateOrders', x => {
    //   self.toastSvc.success('New Order Added!', '', { timeOut: 2000 });
    //   self.onFilterOrders(this.selectedRange);
    // });
  }

  add() {
    this.order = new Order();
    this.order.id = null;
    this.order.clientId = null;
    this.order.restaurantId = null;
    this.order.status = '';
  }

  onAfterSave(event) {
    this.onFilterOrders(this.selectedRange);
    this.toastSvc.success('Update Order Successfully!', '', { timeOut: 2000 });
  }

  onAfterDelete(event) {
    this.toastSvc.success('Delete Order Successfully!', '', { timeOut: 2000 });
    this.onFilterOrders(this.selectedRange);
    if (event.order.id === this.order.id) {
      this.order = new Order();
      this.order.id = null;
      this.order.clientId = null;
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

    if (account.type === 'user') {
      self.orderSvc.find({
        where: { accountId: account.id, delivered: { $gt: new Date(start), $lt: new Date(end) } },
        include: ['account', { items: { product: 'pictures' } }, 'restaurant'],
        order: 'delivered DESC'
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    } else if (account.type === 'business') {
      self.orderSvc.find({
        where: { restaurantId: this.restaurantId, delivered: { $gt: new Date(start), $lt: new Date(end) } },
        include: ['account', { items: { product: 'pictures' } }, 'restaurant'],
        order: 'delivered DESC',
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    } else if (account.type === 'deliver') {
      self.orderSvc.find({
        where: { delivered: { $gt: new Date(start), $lt: new Date(end) } },
        include: ['account', { items: { product: 'pictures' } }, 'restaurant'],
        order: 'delivered DESC',
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    } else if (account.type === 'super') {
      self.orderSvc.find({
        where: { delivered: { $gt: new Date(start), $lt: new Date(end) } },
        include: ['account', { items: { product: 'pictures' } }, 'restaurant'],
        order: 'delivered DESC',
      }).subscribe((orders: Order[]) => {
        self.orders = orders;
      });
    }

  }

  onFilterOrders(s) {
    const self = this;
    this.selectedRange = s;
    const restaurant = this.restaurant;

    if (s === 'daily') {
      const start = this.sharedSvc.getToday();
      const end = this.sharedSvc.getNextNDay(2);
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
      const account = this.account;
      if (account.type === 'super' || account.type === 'deliver') {
        self.orderSvc.find({
          include: ['account', { items: { product: 'pictures' } }, 'restaurant'],
          order: 'delivered DESC',
        }).subscribe((orders: Order[]) => {
          self.orders = orders;
        });
      } else if (account.type === 'restaurant') {
        self.orderSvc.find({
          where: {restaurantId: restaurant.id},
          include: ['account', { items: { product: 'pictures' } }, 'restaurant'],
          order: 'delivered DESC',
        }).subscribe((orders: Order[]) => {
          self.orders = orders;
        });
      } else {
        self.orderSvc.find({
          where: { accountId: account.id },
          include: ['account', { items: { product: 'pictures' } }, 'restaurant'],
          order: 'delivered DESC',
        }).subscribe((orders: Order[]) => {
          self.orders = orders;
        });
      }
    }
  }

}
