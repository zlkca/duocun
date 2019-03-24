import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { SharedModule } from '../shared/shared.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { HomeComponent } from './home/home.component';
import { ClientOrderComponent } from './client-order/client-order.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { WorkerOrderComponent } from './worker-order/worker-order.component';
import { RestaurantListPageComponent } from './restaurant-list-page/restaurant-list-page.component';
import { RestaurantDetailPageComponent } from './restaurant-detail-page/restaurant-detail-page.component';
import { CartPageComponent } from './cart-page/cart-page.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    ToastrModule.forRoot({timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true}),
    SharedModule,
    RestaurantModule,
    ProductModule,
    OrderModule
  ],
  declarations: [
    HomeComponent,
    ClientOrderComponent,
    WorkerOrderComponent,
    RestaurantComponent,
    RestaurantListPageComponent,
    RestaurantDetailPageComponent,
    CartPageComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PageModule { }
