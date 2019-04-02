import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeliveryRoutingModule } from './delivery-routing.module';
import { DeliveryFormPageComponent } from './delivery-form-page/delivery-form-page.component';
import { DeliveryListPageComponent } from './delivery-list-page/delivery-list-page.component';

@NgModule({
  imports: [
    CommonModule,
    DeliveryRoutingModule
  ],
  declarations: [DeliveryFormPageComponent, DeliveryListPageComponent]
})
export class DeliveryModule { }
