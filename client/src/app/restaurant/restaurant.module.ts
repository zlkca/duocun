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
import { ImageUploadModule } from 'angular2-image-upload';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        CommerceModule,
        ProductModule,
        OrderModule,
        ImageUploadModule.forRoot(),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [RestaurantService, LocationService],
    declarations: [RestaurantFormComponent, RestaurantGridComponent, RestaurantListComponent, RestaurantDetailComponent],
    exports: [RestaurantFormComponent, RestaurantGridComponent, RestaurantListComponent, RestaurantDetailComponent]
})
export class RestaurantModule { }
