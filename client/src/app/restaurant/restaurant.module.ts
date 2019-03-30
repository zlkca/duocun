import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProductModule } from '../product/product.module';
import { RestaurantFormComponent } from './restaurant-form/restaurant-form.component';
import { RestaurantGridComponent } from './restaurant-grid/restaurant-grid.component';
import { RestaurantListComponent } from './restaurant-list/restaurant-list.component';
import { OrderModule } from '../order/order.module';
import { RestaurantService } from './restaurant.service';
// import { LocationService } from '../shared/location/location.service';
// import { ImageUploadModule } from 'angular2-image-upload';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ImageUploaderModule } from '../image-uploader/image-uploader.module';
import { RestaurantAboutComponent } from './restaurant-about/restaurant-about.component';
import { RestaurantListPageComponent } from './restaurant-list-page/restaurant-list-page.component';
import { RestaurantDetailPageComponent } from './restaurant-detail-page/restaurant-detail-page.component';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        ProductModule,
        OrderModule,
        // ImageUploadModule.forRoot(),
        ImageUploaderModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
      RestaurantService,
    ],
    declarations: [
      RestaurantFormComponent,
      RestaurantGridComponent,
      RestaurantListComponent,
      RestaurantAboutComponent,
      RestaurantListPageComponent,
      RestaurantDetailPageComponent
    ],
    exports: [RestaurantFormComponent, RestaurantGridComponent, RestaurantListComponent, RestaurantAboutComponent]
})
export class RestaurantModule { }
