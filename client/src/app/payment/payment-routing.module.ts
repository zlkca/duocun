import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentFormPageComponent } from './payment-form-page/payment-form-page.component';

const routes: Routes = [{ path: 'form', component: PaymentFormPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
