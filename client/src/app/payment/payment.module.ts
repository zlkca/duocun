import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { OrderService } from '../order/order.service';
import { TransactionService } from '../transaction/transaction.service';
import { BalanceService } from './balance.service';
import { AccountService } from '../account/account.service';
import { SharedService } from '../shared/shared.service';
import { CreditCardFormComponent } from './credit-card-form/credit-card-form.component';

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule,
    PaymentRoutingModule
  ],
  declarations: [
    PaymentFormComponent,
    CreditCardFormComponent
  ],
  providers: [
    OrderService,
    BalanceService,
    TransactionService,
    AccountService,
    SharedService
  ],
  exports: [
    CreditCardFormComponent
  ]
})
export class PaymentModule { }
