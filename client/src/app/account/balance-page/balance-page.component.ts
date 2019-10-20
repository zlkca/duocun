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

  reload(clientId: string) {
    const self = this;
    const orderQuery = { clientId: clientId, status: { $nin: ['del', 'bad', 'tmp'] } };
    this.orderSvc.quickFind(orderQuery).pipe(takeUntil(this.onDestroy$)).subscribe((os: IOrder[]) => {
      const transactionQuery = { $or: [{ fromId: clientId }, { toId: clientId }] };
      self.transactionSvc.find(transactionQuery).pipe(takeUntil(this.onDestroy$)).subscribe((ts: ITransaction[]) => {
        let list = [];
        let balance = 0;
        const payments = ts.filter(t => t.type === 'credit' && t.fromId === clientId);
        const tOuts = ts.filter(t => t.type === 'transfer' && t.fromId === clientId);
        const tIns = ts.filter(t => t.type === 'transfer' && t.toId === clientId);

        os.map(order => {
          const t = {
            fromId: order.clientId,
            fromName: order.clientName,
            toId: order.driverId,
            toName: order.driverName,
            type: 'debit',
            amount: order.total,
            note: '',
            created: order.created, // order.delivered,
            modified: order.modified
          };
          list.push({ date: t.created, description: order.merchantName, type: t.type, paid: 0, consumed: t.amount, balance: 0 });
        });

        // const groupedTransactions = this.groupBy(ts, 'created');
        // const transactions = [];

        // // combine transactions of the same day
        // Object.keys(groupedTransactions).map(date => {
        //   let total = 0;
        //   groupedTransactions[date].map(t => { total += t.amount; });
        //   transactions.push({ created: date, type: 'credit', amount: total });
        // });

        // transactions.map(t => {
        //   // const items = list.filter(l => moment(l.date).isSame(moment(t.created), 'day'));
        //   // if (items && items.length > 0) {
        //   //   items[0].paid = t.amount;
        //   // } else {
        //   if (t.amount !== 0) {
        //     list.push({ date: t.created, description: '付款', type: t.type, paid: t.amount, consumed: 0, balance: 0 }); // pay tomorrow's
        //   }
        //   // }
        // });

        payments.map(t => {
          if (t.amount !== 0) {
            list.push({ date: t.created, description: '付款', type: 'credit', paid: t.amount, consumed: 0, balance: 0 });
          }
        });

        tIns.map(t => {
          list.push({ date: t.created, description: '转自' + t.fromName, type: 'credit', paid: t.amount, consumed: 0, balance: 0 });
        });

        tOuts.map(t => {
          list.push({ date: t.created, description: '转给' + t.toName, type: 'debit', paid: 0, consumed: t.amount, balance: 0 });
        });

        list = list.sort((a: IClientPaymentData, b: IClientPaymentData) => {
          const aMoment = moment(a.date); // .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          const bMoment = moment(b.date); // .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          if (aMoment.isAfter(bMoment)) {
            return 1; // b at top
          } else {
            return -1;
          }
        });

        list.map(item => {
          balance += item.consumed;
          balance -= item.paid;
          item.balance = balance;
        });

        list.sort((a: IClientPaymentData, b: IClientPaymentData) => {
          const aMoment = moment(a.date); // .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          const bMoment = moment(b.date); // .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          if (aMoment.isAfter(bMoment)) {
            return -1; // b at top
          } else if (bMoment.isAfter(aMoment)) {
            return 1;
          } else {
            if (a.type === 'debit' && b.type === 'credit') {
              return 1;
            } else {
              return -1;
            }
          }
        });

        this.dataSource = new MatTableDataSource(list);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    });
  }

}

