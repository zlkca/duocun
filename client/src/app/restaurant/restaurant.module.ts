import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

import { RestaurantGridComponent } from './restaurant-grid/restaurant-grid.component';
import { RestaurantService } from './restaurant.service';
import { RestaurantAboutComponent } from './restaurant-about/restaurant-about.component';
import { RestaurantListPageComponent } from './restaurant-list-page/restaurant-list-page.component';
import { RestaurantDetailPageComponent } from './restaurant-detail-page/restaurant-detail-page.component';
import { RestaurantRoutingModule } from './restaurant-routing.module';
import { ProductModule } from '../product/product.module';

import { ProductService } from '../product/product.service';
import { CategoryService } from '../category/category.service';
import { OrderService } from '../order/order.service';
import { CartModule } from '../cart/cart.module';
import { MatDialogModule } from '../../../node_modules/@angular/material';
import { DistanceService } from '../location/distance.service';
import { QuitRestaurantDialogComponent } from './quit-restaurant-dialog/quit-restaurant-dialog.component';

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
      RestaurantService,
      ProductService,
      CategoryService,
      OrderService,
      DistanceService
    ],
    declarations: [
      RestaurantGridComponent,
      RestaurantAboutComponent,
      RestaurantListPageComponent,
      RestaurantDetailPageComponent,
      QuitRestaurantDialogComponent
    ],
    exports: [
      RestaurantGridComponent,
      RestaurantAboutComponent
    ],
    entryComponents: [QuitRestaurantDialogComponent]
})
export class RestaurantModule { }
