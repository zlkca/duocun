import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentFormComponent } from './payment-form/payment-form.component';

@NgModule({
  imports: [
    CommonModule,
    PaymentRoutingModule
  ],
  declarations: [PaymentFormComponent],
  exports: [
    // PaymentService,
    // BalanceService
  ]
})
export class PaymentModule { }
