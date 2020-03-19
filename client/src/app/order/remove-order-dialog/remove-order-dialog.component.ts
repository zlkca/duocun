import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Router } from '../../../../node_modules/@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '../../../../node_modules/@angular/material';
import { OrderService } from '../order.service';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { CommandActions } from '../../shared/command.actions';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../account/account.service';
import { IAccount } from '../../account/account.model';
import { PaymentMethod } from '../../payment/payment.model';

declare var Stripe;

export interface DialogData {
  title: string;
  content: string;
  buttonTextNo: string;
  buttonTextYes: string;
  accountId: string;
  orderId: string;
  total: number;
  paymentMethod: string;
  chargeId: string;
  transactionId: string;
}

@Component({
  selector: 'app-remove-order-dialog',
  templateUrl: './remove-order-dialog.component.html',
  styleUrls: ['./remove-order-dialog.component.scss']
})
export class RemoveOrderDialogComponent implements OnInit, OnDestroy {
  stripe;
  balance;
  onDestroy$ = new Subject();
  lang = environment.language;

  constructor(
    private rx: NgRedux<IAppState>,
    private router: Router,
    private orderSvc: OrderService,
    private accountSvc: AccountService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RemoveOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {
    const self = this;
    this.stripe = Stripe(environment.STRIPE.API_KEY);

    if (this.data) {
      const accountId = this.data.accountId;
      self.accountSvc.find({ _id: accountId }).pipe(takeUntil(self.onDestroy$)).subscribe((accounts: IAccount[]) => {
        if (accounts && accounts.length > 0) {
          this.balance = accounts[0].balance;
        }
      });
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onClickCancel(): void {
    this.dialogRef.close();
  }

  onClickRemove(): void {
    const self = this;
    const orderId = this.data.orderId;
    const text = this.lang === 'en' ? 'The Order is cancelled.' : '订单已删除';
    if (this.data && orderId) {
      if (self.data.paymentMethod === PaymentMethod.CREDIT_CARD || self.data.paymentMethod === PaymentMethod.WECHAT) {

        self.orderSvc.removeById(orderId).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
          self.dialogRef.close();
          self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } }); // refresh order history
          self.snackBar.open('', text, { duration: 1000 });
          self.router.navigate(['order/history']);

        });
      } else if (self.data.paymentMethod === PaymentMethod.CASH || self.data.paymentMethod === PaymentMethod.PREPAY) { // cash or prepaid
        self.orderSvc.removeById(self.data.orderId).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
          self.dialogRef.close();
          self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } });
          self.snackBar.open('', text, { duration: 1000 });
          self.router.navigate(['order/history']);

        });
      }
    }
  }

}
