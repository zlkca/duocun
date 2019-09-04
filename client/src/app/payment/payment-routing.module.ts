import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { PayCompleteComponent } from './pay-complete/pay-complete.component';

const routes: Routes = [
  { path: 'form', component: PaymentFormComponent},
  { path: 'complete', component: PayCompleteComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
