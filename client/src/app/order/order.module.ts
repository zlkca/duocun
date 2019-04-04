import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule } from '@angular/material/tabs';

import { SharedModule } from '../shared/shared.module';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderService } from './order.service';
import { WorkerOrderComponent } from './worker-order/worker-order.component';
import { RestaurantOrderComponent } from './restaurant-order/restaurant-order.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderRoutingModule } from './order-routing.module';
import { RestaurantService } from '../restaurant/restaurant.service';
import { OrderFormPageComponent } from './order-form-page/order-form-page.component';

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
  ],
  providers: [
    OrderService,
    RestaurantService
  ],
  declarations: [
    OrderListComponent,
    WorkerOrderComponent,
    RestaurantOrderComponent,
    OrderHistoryComponent,
    OrderFormPageComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class OrderModule { }
