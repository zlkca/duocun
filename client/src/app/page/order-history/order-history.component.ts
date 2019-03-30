import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { OrderService } from '../../order/order.service';
import { SharedService } from '../../shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../lb-sdk';
import { SocketService } from '../../shared/socket.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  account;
  restaurant;
  orders = [];

  constructor(
    private accountSvc: AccountService,
    private orderSvc: OrderService,
    private sharedSvc: SharedService,
    private toastSvc: ToastrService,
    private socketSvc: SocketService
  ) {

  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrent().subscribe(account => {
      self.account = account;
      if (account && account.id) {
        self.reload(account.id);
      } else {
        // should never be here.
        self.orders = [];
      }
    });

    // this.socket.connect(this.authSvc.getToken());
    this.socketSvc.on('updateOrders', x => {
      // self.toastSvc.success('New Order Added!', '', { timeOut: 2000 });
      // self.onFilterOrders(this.selectedRange);
      if (x.clientId === self.account.id) {
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

  reload(clientId) {
    const self = this;
    self.orderSvc.find({ where: { clientId: clientId } }).subscribe(os => {
      const orders = os;
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

  // takeOrder(order) {
  //   const self = this;
  //   order.workerStatus = 'process';
  //   this.orderSvc.replace(order).subscribe(x => {
  //     // self.afterSave.emit({name: 'OnUpdateOrder'});
  //     self.toastSvc.success('Take Order Successfuly!');
  //     self.reload(self.account.id);
  //   });
  // }

  // sendForDeliver(order) {
  //   const self = this;
  //   order.workerStatus = 'done';
  //   this.orderSvc.replace(order).subscribe(x => {
  //     // self.afterSave.emit({name: 'OnUpdateOrder'});
  //     self.toastSvc.success('Send for Order Successfuly!');
  //     self.reload(self.account.id);
  //   });
  // }
}
