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
import { MyAddressComponent } from './my-address/my-address.component';
import { MyOrderComponent } from './my-order/my-order.component';
import { RestaurantComponent } from './restaurant/restaurant.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    ToastrModule.forRoot(),
    SharedModule,
    RestaurantModule,
    ProductModule,
    OrderModule
  ],
  declarations: [
    HomeComponent,
    MyAddressComponent,
    MyOrderComponent,
    RestaurantComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PageModule { }
