import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { OrderService } from '../../order/order.service';
import { SharedService } from '../../shared/shared.service';
import { Order, IOrder } from '../order.model';
// import { SocketService } from '../../shared/socket.service';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
import { OrderActions } from '../order.actions';
import { CartActions } from '../../cart/cart.actions';
import { Router } from '@angular/router';
import { RemoveOrderDialogComponent } from '../remove-order-dialog/remove-order-dialog.component';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { ICommand } from '../../shared/command.reducers';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import * as moment from 'moment';
import { DeliveryActions } from '../../delivery/delivery.actions';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject();
  account;
  restaurant;
  orders = [];
  loading = true;
  highlightedOrderId = 0;

  constructor(
    private accountSvc: AccountService,
    private orderSvc: OrderService,
    private sharedSvc: SharedService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: {name: 'order-history'}
    });
  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrent().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      self.account = account;
      if (account && account.id) {
        self.reload(account.id);
      } else {
        self.orders = []; // should never be here.
      }
    });

    // this.socketSvc.on('updateOrders', x => {
    //   // self.onFilterOrders(this.selectedRange);
    //   if (x.clientId === self.account.id) {
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

    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'reload-orders') {
        self.reload(this.account.id);
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  reload(clientId) {
    const self = this;
    const query = { clientId: clientId, status: { $nin: ['del', 'bad', 'tmp'] } };
    self.orderSvc.find(query).pipe(takeUntil(this.onDestroy$)).subscribe((orders: IOrder[]) => {
      orders.map((order: IOrder) => {
        let subTotal = 0;
        subTotal = order.price + order.deliveryCost;
        order.tax = Math.ceil(subTotal * 13) / 100;
        order.productTotal = order.price;
      });

      orders.sort((a: IOrder, b: IOrder) => {
        const ma = moment(a.delivered).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        const mb = moment(b.delivered).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        if (ma.isAfter(mb)) {
          return -1;
        } else if (mb.isAfter(ma)) {
          return 1;
        } else {
          const ca = moment(a.created);
          const cb = moment(b.created);
          if (ca.isAfter(cb)) {
            return -1;
          } else {
            return 1;
          }
        }
      });
      self.orders = orders;
      self.loading = false;

      self.highlightedOrderId = self.orders[0] ? self.orders[0]._id : null;
    });
  }

  canChange(order: IOrder) {
    const allowDateTime = moment(order.delivered).set({ hour: 9, minute: 30, second: 0, millisecond: 0 });
    return allowDateTime.isAfter(moment());
  }

  changeOrder(order: IOrder) {
    this.rx.dispatch({ type: OrderActions.UPDATE, payload: order });
    this.rx.dispatch({
      type: CartActions.UPDATE_FROM_CHANGE_ORDER,
      payload: {
        items: order.items,
        merchantId: order.merchantId,
        merchantName: order.merchantName,
        deliveryCost: order.deliveryCost,
        deliveryDiscount: order.deliveryDiscount,
      }
    });
    this.rx.dispatch({
      type: DeliveryActions.UPDATE_FROM_CHANGE_ORDER,
      payload: {
        origin: order.location,
        date: moment(order.delivered)
      }
    });
    this.router.navigate(['merchant/list/' + order.merchantId]);
  }

  deleteOrder(order: IOrder) {
    this.openDialog(this.account.id, order._id, order.total, order.paymentMethod, order.transactionId, order.chargeId);
  }

  openDialog(accountId: string, orderId: string, total: number, paymentMethod: string,
    transactionId: string, chargeId: string): void {
    const dialogRef = this.dialog.open(RemoveOrderDialogComponent, {
      width: '300px',
      data: { title: '提示', content: '确认要删除该订单吗？', buttonTextNo: '取消', buttonTextYes: '删除',
      accountId: accountId,
      orderId: orderId,
      total: total,
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      chargeId: chargeId
     },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {

    });
  }

  onSelect(order) {
    // this.select.emit({ order: c });
    this.highlightedOrderId = order.id;
  }

  toDateTimeString(s) {
    return s ? this.sharedSvc.toDateTimeString(s) : '';
  }

  toDateString(s) {
    return s ? this.sharedSvc.toDateString(s) : '';
  }

  // takeOrder(order) {
  //   const self = this;
  //   order.workerStatus = 'process';
  //   this.orderSvc.replace(order).pipe(
  //   takeUntil(this.onDestroy$)
  // ).subscribe(x => {
  //     // self.afterSave.emit({name: 'OnUpdateOrder'});
  //     self.reload(self.account.id);
  //   });
  // }

  // sendForDeliver(order) {
  //   const self = this;
  //   order.workerStatus = 'done';
  //   this.orderSvc.replace(order).pipe(
  //   takeUntil(this.onDestroy$)
  // ).subscribe(x => {
  //     // self.afterSave.emit({name: 'OnUpdateOrder'});
  //     self.reload(self.account.id);
  //   });
  // }
}
