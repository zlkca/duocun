import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Router } from '../../../../node_modules/@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '../../../../node_modules/@angular/material';
import { OrderService } from '../order.service';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { CommandActions } from '../../shared/command.actions';
import { PaymentService } from '../../payment/payment.service';
import { TransactionService } from '../../transaction/transaction.service';
import { environment } from '../../../environments/environment';
import { BalanceService } from '../../payment/balance.service';
import { IBalance } from '../../payment/payment.model';
import { ITransaction } from '../../transaction/transaction.model';

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
  constructor(
    private rx: NgRedux<IAppState>,
    private router: Router,
    private orderSvc: OrderService,
    private balanceSvc: BalanceService,
    private paymentSvc: PaymentService,
    private transactionSvc: TransactionService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RemoveOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {
    const self = this;
    this.stripe = Stripe(environment.STRIPE.API_KEY);

    if (this.data) {
      const accountId = this.data.accountId;
      self.balanceSvc.find({ accountId: accountId }).pipe(takeUntil(self.onDestroy$)).subscribe((bs: IBalance[]) => {
        if (bs && bs.length > 0) {
          this.balance = bs[0];
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
    if (this.data && this.data.orderId) {
        if (self.data.paymentMethod === 'card') {
          self.transactionSvc.find({id: self.data.transactionId}).pipe(takeUntil(self.onDestroy$)).subscribe((ts: any) => {

            self.paymentSvc.refund(self.data.chargeId).pipe(takeUntil(self.onDestroy$)).subscribe((re) => {
              if (re.status === 'succeeded' || re.status === 'charge_already_refunded') {
                self.snackBar.open('', '已成功安排退款。', { duration: 1800 });
              } else {
                alert('退款失败，请联系客服');
              }

              self.orderSvc.removeById(self.data.orderId).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
                self.dialogRef.close();
                self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } });
                self.snackBar.open('', '订单已删除', { duration: 1000 });

                const t = ts[0];
                const payable = Math.round((self.data.total - t.amount) * 100) / 100;
                const q = { accountId: self.data.accountId };
                self.balanceSvc.update(q, { amount: payable }).pipe(takeUntil(this.onDestroy$)).subscribe(bs => {
                  self.snackBar.open('', '余额已更新', { duration: 1800 });

                  self.rmTransaction(self.data.transactionId, () => {
                    self.router.navigate(['order/history']);
                  });
                });
              });
            });
          });
        } else {
          self.orderSvc.removeById(self.data.orderId).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
            self.dialogRef.close();
            self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } });
            self.snackBar.open('', '订单已删除', { duration: 1000 });
            const payable = Math.round((self.balance.amount + self.data.total) * 100) / 100;
            const q = { accountId: self.data.accountId };
            self.balanceSvc.update(q, { amount: payable }).pipe(takeUntil(this.onDestroy$)).subscribe(bs => {
              self.snackBar.open('', '余额已更新', { duration: 1800 });
              self.router.navigate(['order/history']);
            });
          });
        }
    }
  }

  rmTransaction(transactionId, cb?: any) {
    this.transactionSvc.removeById(transactionId).pipe(takeUntil(this.onDestroy$)).subscribe(t => {
      this.snackBar.open('', '已删除交易', { duration: 1000 });
      if (cb) {
        cb(t);
      }
    });
  }

  // updateBalance(order: IOrder) {
  //   const clientPayment: IPayment = {
  //     clientId: order.clientId,
  //     clientName: order.clientName,
  //     driverId: '',
  //     driverName: '',
  //     credit: 0,
  //     debit: order.total,
  //     balance: -order.total,
  //     created: new Date(),
  //     modified: new Date(),
  //   };

  //   this.paymentSvc.save(clientPayment).pipe(takeUntil(this.onDestroy$)).subscribe(x => {
  //     this.snackBar.open('', '已保存客户的余额', { duration: 2300 });
  //   });
  // }
}
