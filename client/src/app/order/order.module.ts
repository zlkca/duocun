import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderListComponent } from './order-list/order-list.component';
import { CartComponent } from './cart/cart.component';
import { OrderService } from './order.service';
import { OrderFormComponent } from './order-form/order-form.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    OrderDetailComponent,
    OrderListComponent,
    CartComponent,
    OrderFormComponent,
  ],
  providers: [
    OrderService,
  ],
  declarations: [
    OrderDetailComponent,
    OrderListComponent,
    CartComponent,
    OrderFormComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class OrderModule { }
