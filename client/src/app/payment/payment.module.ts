import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentPageComponent } from './payment-page/payment-page.component';
import { PaymentFormPageComponent } from './payment-form-page/payment-form-page.component';

@NgModule({
  imports: [
    CommonModule,
    PaymentRoutingModule
  ],
  declarations: [PaymentPageComponent, PaymentFormPageComponent],
  exports: [
    // PaymentService,
    // BalanceService
  ]
})
export class PaymentModule { }
