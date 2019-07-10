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
      payload: 'order-history'
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
    const query = { clientId: clientId, status: { $nin: ['del', 'bad'] }  };
    self.orderSvc.find(query).pipe(takeUntil(this.onDestroy$)).subscribe((orders: IOrder[]) => {
      orders.map((order: IOrder) => {
        let productTotal = 0;
        let subTotal = 0;
        const items = order.items;
        if (items && items.length > 0) {
          items.map(x => {
            productTotal += x.price * x.quantity;
          });
        }
        subTotal = productTotal + order.deliveryCost;
        order.tax = Math.ceil(subTotal * 13) / 100;
        order.productTotal = productTotal;
      });

      orders.sort((a: IOrder, b: IOrder) => {
        const ma = moment(a.created).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        const mb = moment(b.created).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        if (moment(ma).isAfter(mb)) {
          return -1;
        } else {
          return 1;
        }
      });
      self.orders = orders;
      self.loading = false;
    });
  }

  canChange(order: IOrder) {
    const deliverDate = this.sharedSvc.getDate(order.delivered);
    const now = this.sharedSvc.getDate(new Date());
    const allowDateTime = deliverDate.set({ hour: 9, minute: 30, second: 0, millisecond: 0 });
    return allowDateTime.isAfter(now);
  }

  changeOrder(order: IOrder) {
    this.rx.dispatch({ type: OrderActions.UPDATE, payload: order });
    const from = moment(order.delivered).toDate();
    const to = moment(order.delivered).set({ hour: 13, minute: 30, second: 0, millisecond: 0 }).toDate();
    let text = '';
    if (moment(order.delivered).isSame(moment())) {
      text = '今天午餐';
    } else if (moment(order.delivered).isSame(moment().add(1, 'days'))) {
      text = '明天午餐';
    } else if (moment(order.delivered).isSame(moment().add(2, 'days'))) {
      text = '后天午餐';
    }

    this.rx.dispatch({
      type: CartActions.UPDATE_FROM_CHANGE_ORDER,
      payload: {
        items: order.items,
        merchantId: order.merchantId,
        merchantName: order.merchantName,
        deliveryCost: order.deliveryFee + order.deliveryDiscount,
        deliveryFee: order.deliveryFee,
        deliveryDiscount: order.deliveryDiscount,
      }
    });
    this.rx.dispatch({
      type: DeliveryActions.UPDATE_FROM_CHANGE_ORDER,
      payload: {
        origin: order.location,
        fromTime: from,
        toTime: to
      }
    });
    this.router.navigate(['restaurant/list/' + order.merchantId]);
  }

  deleteOrder(order: IOrder) {
    this.openDialog(order.id);
  }

  openDialog(orderId: string): void {
    const dialogRef = this.dialog.open(RemoveOrderDialogComponent, {
      width: '300px',
      data: { title: '提示', content: '确认要删除该订单吗？', buttonTextNo: '取消', buttonTextYes: '删除', orderId: orderId },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {

    });
  }

  onSelect(c) {
    // this.select.emit({ order: c });
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
