import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { WorkerOrderComponent } from './worker-order/worker-order.component';
import { RestaurantOrderComponent } from './restaurant-order/restaurant-order.component';
import { OrderFormPageComponent } from './order-form-page/order-form-page.component';

const routes: Routes = [
  { path: 'history', component: OrderHistoryComponent },
  { path: 'form', component: OrderFormPageComponent },
  // { path: 'list-client', component: ClientOrderComponent },
  { path: 'list-worker', component: WorkerOrderComponent },
  { path: 'list-restaurant', component: RestaurantOrderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }
