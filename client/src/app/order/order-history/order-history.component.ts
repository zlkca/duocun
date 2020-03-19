import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { OrderService } from '../../order/order.service';
import { SharedService } from '../../shared/shared.service';
import { IOrder, OrderType, OrderStatus } from '../order.model';
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
import { environment } from '../../../environments/environment';
import { LocationService } from '../../location/location.service';
import { ILocation } from '../../location/location.model';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject();
  account;
  orders = [];
  loading = true;
  highlightedOrderId = 0;
  currentPageNumber = 1;
  itemsPerPage = 10;
  nOrders = 0;
  lang = environment.language;
  OrderTypes = OrderType;

  constructor(
    private accountSvc: AccountService,
    private orderSvc: OrderService,
    private sharedSvc: SharedService,
    private locationSvc: LocationService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: { name: 'order-history' }
    });
  }

  ngOnInit() {
    const self = this;
    this.loading = true;
    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      self.account = account;
      if (account && account._id) {
        self.OnPageChange(this.currentPageNumber);
      } else {
        self.orders = []; // should never be here.
        this.loading = false;
      }
    });

    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'reload-orders') {
        self.OnPageChange(this.currentPageNumber);
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  reload(clientId) {
    // const self = this;
    // const query = { clientId: clientId, status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] } };
    // self.orderSvc.find(query).pipe(takeUntil(this.onDestroy$)).subscribe((orders: IOrder[]) => {
    //   orders.map((order: IOrder) => {
    //     let subTotal = 0;
    //     subTotal = order.price + order.deliveryCost;
    //     order.tax = Math.ceil(subTotal * 13) / 100;
    //     order.price = order.price;
    //   });

    //   orders.sort((a: IOrder, b: IOrder) => {
    //     const ma = moment(a.delivered).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    //     const mb = moment(b.delivered).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    //     if (ma.isAfter(mb)) {
    //       return -1;
    //     } else if (mb.isAfter(ma)) {
    //       return 1;
    //     } else {
    //       const ca = moment(a.created);
    //       const cb = moment(b.created);
    //       if (ca.isAfter(cb)) {
    //         return -1;
    //       } else {
    //         return 1;
    //       }
    //     }
    //   });
    //   self.orders = orders;
    //   self.loading = false;

    //   self.highlightedOrderId = self.orders[0] ? self.orders[0]._id : null;
    // });
  }

  // deprecated
  canChange(order: IOrder) {
    const allowDateTime = moment(order.delivered).set({ hour: 9, minute: 30, second: 0, millisecond: 0 });
    return allowDateTime.isAfter(moment());
  }

  // deprecated
  changeOrder(order: IOrder) {
    // this.rx.dispatch({ type: OrderActions.UPDATE_ORDER, payload: order });
    // this.rx.dispatch({
    //   type: CartActions.UPDATE_FROM_CHANGE_ORDER,
    //   payload: {
    //     items: order.items,
    //     merchantId: order.merchantId,
    //     merchantName: order.merchantName,
    //     deliveryCost: order.deliveryCost,
    //     deliveryDiscount: order.deliveryDiscount,
    //   }
    // });
    // this.rx.dispatch({
    //   type: DeliveryActions.UPDATE_FROM_CHANGE_ORDER,
    //   payload: {
    //     origin: order.location,
    //     date: moment(order.delivered)
    //   }
    // });
    // this.router.navigate(['merchant/list/' + order.merchantId]);
  }

  deleteOrder(order: IOrder) {
    const accountId = this.account._id;
    this.openDialog(accountId, order._id, order.total, order.paymentMethod, order.transactionId, order.chargeId);
  }

  openDialog(accountId: string, orderId: string, total: number, paymentMethod: string,
    transactionId: string, chargeId: string): void {
    const dialogRef = this.dialog.open(RemoveOrderDialogComponent, {
      width: '300px',
      data: {
        title: this.lang === 'en' ? 'Hint' : '提示',
        content: this.lang === 'en' ? 'Are you sure to remove this order ?' : '确认要删除该订单吗？',
        buttonTextNo: this.lang === 'en' ? 'Cancel' : '取消',
        buttonTextYes: this.lang === 'en' ? 'Remove' : '删除',
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
    this.highlightedOrderId = order._id;
  }

  toDateTimeString(s) {
    return s ? this.sharedSvc.toDateTimeString(s) : '';
  }

  toDateString(s) {
    return s ? this.sharedSvc.toDateString(s) : '';
  }

  getDescription(order) {
    const d = order.delivered.split('T')[0];
    // const y = +(d.split('-')[0]);
    const m = +(d.split('-')[1]);
    const prevMonth = m === 1 ? 12 : (m - 1);

    const product = order.items[0].product;
    const productName = this.lang === 'en' ? product.name : product.nameEN;
    const range = prevMonth + '/27 ~ ' + m + '/26';

    if (order.type === 'MM') {
      return range + (this.lang === 'en' ? ' Phone monthly fee' : ' 电话月费');
    // } else if (order.type === 'MS') {
    //   return (this.lang === 'en' ? ' Phone setup fee' : ' 电话安装费');
    } else {
      return '';
    }
  }

  OnPageChange(pageNumber) {
    const accountId = this.account._id;
    const itemsPerPage = this.itemsPerPage;

    this.loading = true;
    this.currentPageNumber = pageNumber;
    const query = { clientId: accountId, status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP] } };
    this.orderSvc.loadPage(query, pageNumber, itemsPerPage).pipe(takeUntil(this.onDestroy$)).subscribe((ret: any) => {
      ret.orders.map(order => {
        order.description = this.getDescription(order);
        if (environment.language === 'en') {
          order.merchantName = order.merchant ? order.merchant.nameEN : '';
          order.items.map(item => {
            item.product.name = item.product.nameEN;
          });
        }
      });

      this.orders = ret.orders;
      this.nOrders = ret.total;
      this.loading = false;
    });
  }

  getAddress(location: ILocation) {
    return this.locationSvc.getAddrString(location);
  }

}
