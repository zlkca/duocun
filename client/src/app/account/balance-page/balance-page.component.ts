import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from '../../../../node_modules/rxjs';
import { PageActions } from '../../main/main.actions';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { IBalance, IPayment } from '../../payment/payment.model';
import { BalanceService } from '../../payment/balance.service';
import { AccountService } from '../account.service';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import * as moment from 'moment';
import { PaymentService } from '../../payment/payment.service';

@Component({
  selector: 'app-balance-page',
  templateUrl: './balance-page.component.html',
  styleUrls: ['./balance-page.component.scss']
})
export class BalancePageComponent implements OnInit, OnDestroy {
  account: Account;
  phone;
  address;
  onDestroy$ = new Subject<any>();
  contact;
  phoneVerified;
  payments;
  balance;

  constructor(
    private accountSvc: AccountService,
    // private authSvc: AuthService,
    private rx: NgRedux<IAppState>,
    // private router: Router,
    private paymentSvc: PaymentService,
    private balanceSvc: BalanceService
  ) {
    const self = this;
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'balance'
    });

    self.accountSvc.getCurrentUser().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: Account) => {
      self.account = account;

      self.balanceSvc.find({ where: { accountId: account.id } }).pipe(
        takeUntil(this.onDestroy$)
      ).subscribe((bs: IBalance[]) => {
        if (bs && bs.length > 0) {
          const balances = bs.sort((a: IBalance, b: IBalance) => {
            if (moment(a.created).isAfter(b.created)) {
              return -1;
            } else {
              return 1;
            }
          });

          this.balance = balances[0];
        }
      });

      self.paymentSvc.find({ where: { clientId: account.id } }).pipe(
        takeUntil(this.onDestroy$)
      ).subscribe((ps: IPayment[]) => {
        const payments = ps.sort((a: IBalance, b: IBalance) => {
          if (moment(a.created).isAfter(b.created)) {
            return -1;
          } else {
            return 1;
          }
        });

        this.payments = payments;
      });
    });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
