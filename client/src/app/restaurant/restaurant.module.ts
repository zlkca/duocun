import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductModule } from '../product/product.module';
import { CommerceModule } from '../commerce/commerce.module';
import { RestaurantFormComponent } from './restaurant-form/restaurant-form.component';
import { RestaurantGridComponent } from './restaurant-grid/restaurant-grid.component';
import { RestaurantListComponent } from './restaurant-list/restaurant-list.component';
import { RestaurantDetailComponent } from './restaurant-detail/restaurant-detail.component';
import { OrderModule } from '../order/order.module';
import { RestaurantService } from './restaurant.service';
import { LocationService } from '../shared/location/location.service';
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        CommerceModule,
        ProductModule,
        OrderModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [RestaurantService, LocationService],
    declarations: [RestaurantFormComponent, RestaurantGridComponent, RestaurantListComponent, RestaurantDetailComponent],
    exports: [RestaurantFormComponent, RestaurantGridComponent, RestaurantListComponent, RestaurantDetailComponent]
})
export class RestaurantModule { }
