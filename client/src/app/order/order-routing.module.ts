import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderFormPageComponent } from './order-form-page/order-form-page.component';

const routes: Routes = [
  { path: 'history', component: OrderHistoryComponent },
  { path: 'form', component: OrderFormPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }
