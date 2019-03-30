import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { OrderListComponent } from './order-list/order-list.component';
import { CartComponent } from './cart/cart.component';
import { OrderService } from './order.service';
import { OrderFormComponent } from './order-form/order-form.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ClientOrderComponent } from './client-order/client-order.component';
import { WorkerOrderComponent } from './worker-order/worker-order.component';
import { RestaurantOrderComponent } from './restaurant-order/restaurant-order.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { CartPageComponent } from './cart-page/cart-page.component';
import { OrderRoutingModule } from './order-routing.module';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    OrderRoutingModule,
    SharedModule,
  ],
  exports: [
    OrderListComponent,
    CartComponent,
    OrderFormComponent,
  ],
  providers: [
    OrderService,
  ],
  declarations: [
    OrderListComponent,
    CartComponent,
    OrderFormComponent,
    ClientOrderComponent,
    WorkerOrderComponent,
    RestaurantOrderComponent,
    OrderHistoryComponent,
    CartPageComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class OrderModule { }
