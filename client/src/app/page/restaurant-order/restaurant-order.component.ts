import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { AccountService } from '../../account/account.service';
import { OrderService } from '../../order/order.service';
import { SocketConnection } from '../../lb-sdk/sockets/socket.connections';
import { AuthService } from '../../account/auth.service';
import { SharedService } from '../../shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../lb-sdk';

@Component({
  selector: 'app-restaurant-order',
  templateUrl: './restaurant-order.component.html',
  styleUrls: ['./restaurant-order.component.scss']
})
export class RestaurantOrderComponent implements OnInit {
  account;
  restaurant;
  orders = [];

  constructor(
    private restaurantSvc: RestaurantService,
    private accountSvc: AccountService,
    private orderSvc: OrderService,
    private authSvc: AuthService,
    private sharedSvc: SharedService,
    private toastSvc: ToastrService,
    private socket: SocketConnection
  ) {

  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrent().subscribe(account => {
      self.account = account;
      self.restaurantSvc.find({ where: { ownerId: account.id } }).subscribe(rs => {
        if (rs && rs.length > 0) {
          self.restaurant = rs[0];
          self.reload(rs[0].id);
        }
      });
    });

    this.socket.connect(this.authSvc.getToken());
    this.socket.on('updateOrders', x => {
      // self.toastSvc.success('New Order Added!', '', { timeOut: 2000 });
      // self.onFilterOrders(this.selectedRange);
      if (x.restaurantId === self.restaurant.id) {
        const index = self.orders.findIndex(i => i.id === x.id);
        if (index !== -1) {
          self.orders[index] = x;
        } else {
          self.orders.push(x);
        }
        self.orders.sort((a: Order, b: Order) => {
          if (this.sharedSvc.compareDateTime(a.created, b.created)) {
            return -1;
          } else {
            return 1;
          }
        });
      }
    });
  }

  reload(restaurantId) {
    const self = this;
    self.orderSvc.find({ where: { restaurantId: restaurantId } }).subscribe(os => {
      const orders = os.filter(order => order.restaurantStatus !== 'done');
      orders.sort((a: Order, b: Order) => {
        if (this.sharedSvc.compareDateTime(a.created, b.created)) {
          return -1;
        } else {
          return 1;
        }
      });

      self.orders = orders;
    });
  }

  onSelect(c) {
    // this.select.emit({ order: c });
  }

  getTotal(order) {
    return this.sharedSvc.getTotal(order.items);
  }

  toDateTimeString(s) {
    return s ? this.sharedSvc.toDateTimeString(s) : '';
  }

  takeOrder(order) {
    const self = this;
    order.restaurantStatus = 'process';
    this.orderSvc.replace(order).subscribe(x => {
      // self.afterSave.emit({name: 'OnUpdateOrder'});
      self.toastSvc.success('Take Order Successfuly!');
      self.reload(self.restaurant.id);
    });
  }

  sendForDeliver(order) {
    const self = this;
    order.restaurantStatus = 'done';
    this.orderSvc.replace(order).subscribe(x => {
      // self.afterSave.emit({name: 'OnUpdateOrder'});
      self.toastSvc.success('Send for Order Successfuly!');
      self.reload(self.restaurant.id);
    });
  }
}
