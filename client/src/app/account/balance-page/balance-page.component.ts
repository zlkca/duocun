import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Role } from '../../account/account.model';
import { MatPaginator, MatSort } from '../../../../node_modules/@angular/material';
import * as moment from 'moment';

import { MatTableDataSource } from '@angular/material/table';
import { OrderService } from '../../order/order.service';
import { TransactionService } from '../../transaction/transaction.service';
import { IClientPaymentData } from '../../payment/payment.model';
import { IOrder } from '../../order/order.model';
import { ITransaction } from '../../transaction/transaction.model';

@Component({
  selector: 'app-balance-page',
  templateUrl: './balance-page.component.html',
  styleUrls: ['./balance-page.component.scss']
})
export class BalancePageComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject();
  account;
  alexcredits;
  displayedColumns: string[] = ['date', 'description', 'consumed', 'paid', 'balance'];
  list = [];
  dataSource: MatTableDataSource<IClientPaymentData>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private accountSvc: AccountService,
    private orderSvc: OrderService,
    private transactionSvc: TransactionService
  ) {

  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrent().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      this.account = account;
      if (account) {
        self.reload(account.id);
      } else {

      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  groupBy(items, key) {
    return items.reduce((result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }), {});
  }

  getDescription(t, clientId) {
    if (t.action === 'client cancel order from duocun') {
      return '取消' + t.toName;
    } else if (t.action === 'pay by card') {
      return '银行卡付款';
    } else if (t.action === 'pay by wechat') {
      return '微信付款';
    } else {
      return t.fromId === clientId ? t.toName : t.fromName;
    }
  }

  reload(clientId: string) {
    const transactionQuery = { $or: [{ fromId: clientId }, { toId: clientId }] };
    this.transactionSvc.quickFind(transactionQuery).pipe(takeUntil(this.onDestroy$)).subscribe((ts: ITransaction[]) => {
      let list = [];

      ts.map(t => {
        const b = t.fromId === clientId ? t.fromBalance : t.toBalance;
        const description = this.getDescription(t, clientId);
        const consumed = t.toId === clientId ? t.amount : 0;
        const paid = t.fromId === clientId ? t.amount : 0;
        list.push({ date: t.created, description: description, consumed: consumed, paid: paid, balance: -b });
      });

      list = list.sort((a: any, b: any) => {
        const aMoment = moment(a.date);
        const bMoment = moment(b.date); // .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        if (aMoment.isAfter(bMoment)) {
          return -1;
        } else {
          return 1;
        }
      });

      this.dataSource = new MatTableDataSource(list);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
}

