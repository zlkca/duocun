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

export interface DialogData {
  title: string;
  content: string;
  buttonTextNo: string;
  buttonTextYes: string;
  orderId: string;
}

@Component({
  selector: 'app-remove-order-dialog',
  templateUrl: './remove-order-dialog.component.html',
  styleUrls: ['./remove-order-dialog.component.scss']
})
export class RemoveOrderDialogComponent implements OnInit, OnDestroy {

  onDestroy$ = new Subject();
  constructor(
    private rx: NgRedux<IAppState>,
    private router: Router,
    private orderSvc: OrderService,
    private paymentSvc: PaymentService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RemoveOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onClickCancel(): void {
    this.dialogRef.close();
  }

  onClickRemove(): void {
    if (this.data && this.data.orderId) {
      // this.paymentSvc.remove({where: {orderId: this.data.orderId}}).pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      //   this.snackBar.open('', '已还原客户的余额', { duration: 1500 });
      // });
      this.paymentSvc.remove({where: {orderId: this.data.orderId }}).pipe(
        takeUntil(this.onDestroy$)).subscribe(y => {

        this.orderSvc.removeById(this.data.orderId).pipe(
          takeUntil(this.onDestroy$)
        ).subscribe(x => {
          this.dialogRef.close();
          this.rx.dispatch({type: CommandActions.SEND, payload: { name: 'reload-orders', args: null }});
          this.snackBar.open('', '订单已删除', {duration: 1000});
          this.router.navigate(['order/history']);
        });
      });
    }
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
