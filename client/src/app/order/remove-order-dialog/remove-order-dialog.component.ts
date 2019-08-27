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

declare var Stripe;

export interface DialogData {
  title: string;
  content: string;
  buttonTextNo: string;
  buttonTextYes: string;
  orderId: string;
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
  onDestroy$ = new Subject();
  constructor(
    private rx: NgRedux<IAppState>,
    private router: Router,
    private orderSvc: OrderService,
    private paymentSvc: PaymentService,
    private transactionSvc: TransactionService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RemoveOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {
    this.stripe = Stripe(environment.STRIPE.API_KEY);
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
      this.paymentSvc.remove({ orderId: this.data.orderId }).pipe(takeUntil(this.onDestroy$)).subscribe(y => {
        if (this.data.paymentMethod === 'card') {
          this.rmTransaction(this.data.transactionId, () => {
            self.paymentSvc.refund(this.data.chargeId).pipe(takeUntil(this.onDestroy$)).subscribe((re) => {
              if (re.status === 'succeeded') {
                self.snackBar.open('', '已成功安排退款。', { duration: 1800 });
              } else {
                alert('退款失败，请联系客服');
              }

              this.orderSvc.removeById(this.data.orderId).pipe(takeUntil(this.onDestroy$)).subscribe(x => {
                this.dialogRef.close();
                this.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } });
                this.snackBar.open('', '订单已删除', { duration: 1000 });
                this.router.navigate(['order/history']);
              });
            });
          });
        } else {
          this.orderSvc.removeById(this.data.orderId).pipe(takeUntil(this.onDestroy$)).subscribe(x => {
            this.dialogRef.close();
            this.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } });
            this.snackBar.open('', '订单已删除', { duration: 1000 });
            this.router.navigate(['order/history']);
          });
        }


      });
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
