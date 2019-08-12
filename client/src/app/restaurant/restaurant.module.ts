import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '../../../node_modules/@angular/material';
import { RestaurantAboutComponent } from './restaurant-about/restaurant-about.component';
import { RestaurantRoutingModule } from './restaurant-routing.module';
import { ProductModule } from '../product/product.module';

import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';
import { CartModule } from '../cart/cart.module';

import { DistanceService } from '../location/distance.service';
// import { QuitRestaurantDialogComponent } from './quit-restaurant-dialog/quit-restaurant-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatDialogModule,
        RestaurantRoutingModule,
        ProductModule,
        CartModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
      ProductService,
      OrderService,
      DistanceService
    ],
    declarations: [
      RestaurantAboutComponent,
      // QuitRestaurantDialogComponent
    ],
    exports: [
      RestaurantAboutComponent
    ]
})
export class RestaurantModule { }
