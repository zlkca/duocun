// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Subject } from '../../../../node_modules/rxjs';
// import { PageActions } from '../../main/main.actions';
// import { takeUntil } from '../../../../node_modules/rxjs/operators';
// import { IBalance, IPayment, IClientPayment } from '../../payment/payment.model';
// // import { BalanceService } from '../../payment/balance.service';
// import { AccountService } from '../account.service';
// import { NgRedux } from '../../../../node_modules/@angular-redux/store';
// import { IAppState } from '../../store';
// import * as moment from 'moment';
// import { PaymentService } from '../../payment/payment.service';
// import { OrderService } from '../../order/order.service';
// import { IOrder } from '../../order/order.model';

// @Component({
//   selector: 'app-balance-page',
//   templateUrl: './balance-page.component.html',
//   styleUrls: ['./balance-page.component.scss']
// })
// export class BalancePageComponent implements OnInit, OnDestroy {
//   account: Account;
//   phone;
//   address;
//   onDestroy$ = new Subject<any>();
//   contact;
//   phoneVerified;
//   payments;
//   balance: number;

//   constructor(
//     private accountSvc: AccountService,
//     // private authSvc: AuthService,
//     private rx: NgRedux<IAppState>,
//     // private router: Router,
//     private paymentSvc: PaymentService,
//     private orderSvc: OrderService
//     // private balanceSvc: BalanceService
//   ) {
//     const self = this;
//     this.rx.dispatch({
//       type: PageActions.UPDATE_URL,
//       payload: 'balance'
//     });

//     self.accountSvc.getCurrentUser().pipe(
//       takeUntil(this.onDestroy$)
//     ).subscribe((account: Account) => {
//       self.account = account;

//       // self.balanceSvc.find({ where: { accountId: account.id } }).pipe(
//       //   takeUntil(this.onDestroy$)
//       // ).subscribe((bs: IBalance[]) => {
//       //   if (bs && bs.length > 0) {
//       //     const balances = bs.sort((a: IBalance, b: IBalance) => {
//       //       if (moment(a.created).isAfter(b.created)) {
//       //         return -1;
//       //       } else {
//       //         return 1;
//       //       }
//       //     });

//       //     this.balance = balances[0];
//       //   }
//       // });
//       self.balance = 0;

//       self.orderSvc.find({ where: { clientId: account.id } }).pipe(takeUntil(this.onDestroy$)).subscribe((os: IOrder[]) => {
//         let payments = [];

//         os.map(order => {
//           if (order.status !== 'bad') {
//             self.balance -= order.total;
//             payments.push({ delivered: order.delivered, amount: order.total, type: 'debit' });
//           }
//         });

//         self.paymentSvc.find({where: {clientId: account.id}}).pipe(takeUntil(this.onDestroy$)).subscribe((ps: IClientPayment[]) => {
//           ps.map(p => {
//             if (p.type === 'credit' && p.amount > 0) {
//               self.balance += p.amount;
//               payments.push({ delivered: p.created, amount: p.amount, type: 'credit' });
//             }
//           });

//           payments = payments.sort((a: IClientPayment, b: IClientPayment) => {
//             if (moment(a.delivered).isAfter(moment(b.delivered))) {
//               return -1;
//             } else {
//               return 1;
//             }
//           });

//           this.payments = payments;
//         });
//       });
//     });
//   }

//   ngOnInit() {

//   }

//   ngOnDestroy() {
//     this.onDestroy$.next();
//     this.onDestroy$.complete();
//   }
// }



import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil, take } from '../../../../node_modules/rxjs/operators';
import { Role } from '../../account/account.model';
import { MatSnackBar, MatPaginator, MatSort } from '../../../../node_modules/@angular/material';
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
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private accountSvc: AccountService,
    private orderSvc: OrderService,
    private transactionSvc: TransactionService
  ) {

  }

  ngOnInit() {
    const self = this;
    self.accountSvc.getCurrent().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      this.account = account;
      if (account && account.roles) {
        const roles = account.roles;
        if (roles && roles.length > 0 && roles.indexOf(Role.SUPER) !== -1) {
          self.reload(account.id);
        }
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
    this.orderSvc.find({ clientId: clientId, status: { $ne: 'bad' } }).pipe(takeUntil(this.onDestroy$)).subscribe((os: IOrder[]) => {
      this.transactionSvc.find({ type: 'credit', fromId: clientId }).pipe(takeUntil(this.onDestroy$)).subscribe((ts: ITransaction[]) => {
        let list = [];
        let balance = 0;

        os.map(order => {
          const t = {
            fromId: order.clientId,
            fromName: order.clientName,
            toId: order.driverId,
            toName: order.driverName,
            type: 'debit',
            amount: order.total,
            note: '',
            created: order.delivered,
            modified: order.modified
          };
          list.push({ date: t.created, description: order.merchantName, type: t.type, paid: 0, consumed: t.amount, balance: 0 });
        });

        ts.map(t => {
          const item = list.find(l => moment(l.date).isSame(moment(t.created), 'day'));
          if (item) {
            item.paid = t.amount;
          } else {
            list.push({ date: t.created, description: '', type: t.type, paid: t.amount, consumed: 0, balance: 0 });
          }
        });

        list = list.sort((a: IClientPaymentData, b: IClientPaymentData) => {
          const aMoment = moment(a.date);
          const bMoment = moment(b.date);
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
          const aMoment = moment(a.date);
          const bMoment = moment(b.date);
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

