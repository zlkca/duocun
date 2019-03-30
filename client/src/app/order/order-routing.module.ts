import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { ClientOrderComponent } from './client-order/client-order.component';
import { WorkerOrderComponent } from './worker-order/worker-order.component';
import { RestaurantOrderComponent } from './restaurant-order/restaurant-order.component';
import { CartPageComponent } from './cart-page/cart-page.component';

const routes: Routes = [
  { path: 'order-history', component: OrderHistoryComponent },
  { path: 'client-orders', component: ClientOrderComponent },
  { path: 'worker-orders', component: WorkerOrderComponent },
  { path: 'restaurant-orders', component: RestaurantOrderComponent },
  { path: 'cart', component: CartPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }
