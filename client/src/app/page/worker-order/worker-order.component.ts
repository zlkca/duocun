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
  selector: 'app-worker-order',
  templateUrl: './worker-order.component.html',
  styleUrls: ['./worker-order.component.scss']
})
export class WorkerOrderComponent implements OnInit {
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
      self.reload(account.id);
    });

    // this.socket.connect(this.authSvc.getToken());
    // this.socket.on('updateOrders', x => {
    //   // self.toastSvc.success('New Order Added!', '', { timeOut: 2000 });
    //   // self.onFilterOrders(this.selectedRange);

    //   if (x.workerId === self.account.id) {
    //     const index = self.orders.findIndex(i => i.id === x.id);
    //     if (index !== -1) {
    //       self.orders[index] = x;
    //     } else {
    //       self.orders.push(x);
    //     }
    //     self.orders.sort((a: Order, b: Order) => {
    //       if (this.sharedSvc.compareDateTime(a.created, b.created)) {
    //         return -1;
    //       } else {
    //         return 1;
    //       }
    //     });
    //   }
    // });
  }

  reload(workerId) {
    const self = this;
    self.orderSvc.find({ where: { workerId: workerId } }).subscribe(os => {
      const orders = os.filter(order => order.workerStatus !== 'done');
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
    order.workerStatus = 'process';
    this.orderSvc.replace(order).subscribe(x => {
      // self.afterSave.emit({name: 'OnUpdateOrder'});
      self.toastSvc.success('Take Order Successfuly!');
      self.reload(self.account.id);
    });
  }

  delivered(order) {
    const self = this;
    order.workerStatus = 'done';
    this.orderSvc.replace(order).subscribe(x => {
      // self.afterSave.emit({name: 'OnUpdateOrder'});
      self.toastSvc.success('Send for Order Successfuly!');
      self.reload(self.account.id);
    });
  }
}
