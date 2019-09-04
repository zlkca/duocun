import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { PayCompleteComponent } from './pay-complete/pay-complete.component';
import { OrderService } from '../order/order.service';
import { TransactionService } from '../transaction/transaction.service';
import { BalanceService } from './balance.service';

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule,
    PaymentRoutingModule
  ],
  declarations: [PaymentFormComponent, PayCompleteComponent],
  providers: [
    OrderService,
    BalanceService,
    TransactionService
  ]
})
export class PaymentModule { }
