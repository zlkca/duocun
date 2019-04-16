import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';


// import { ProductModule } from '../product/product.module';
import { RestaurantGridComponent } from './restaurant-grid/restaurant-grid.component';
// import { OrderModule } from '../order/order.module';
import { RestaurantService } from './restaurant.service';
// import { LocationService } from '../shared/location/location.service';
// import { ImageUploadModule } from 'angular2-image-upload';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ImageUploaderModule } from '../image-uploader/image-uploader.module';
import { RestaurantAboutComponent } from './restaurant-about/restaurant-about.component';
import { RestaurantListPageComponent } from './restaurant-list-page/restaurant-list-page.component';
import { RestaurantDetailPageComponent } from './restaurant-detail-page/restaurant-detail-page.component';
import { RestaurantRoutingModule } from './restaurant-routing.module';
import { ProductModule } from '../product/product.module';

import { ProductService } from '../product/product.service';
import { CategoryService } from '../category/category.service';
import { OrderService } from '../order/order.service';
import { CartModule } from '../cart/cart.module';
import { WarningDialogComponent } from '../shared/warning-dialog/warning-dialog.component';
import { MatDialogModule } from '../../../node_modules/@angular/material';
import { DistanceService } from '../location/distance.service';

@NgModule({
    imports: [
        CommonModule,
        // NgbModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatDialogModule,
        RestaurantRoutingModule,
        ProductModule,
        // OrderModule,
        // ImageUploadModule.forRoot(),
        ImageUploaderModule,
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
      RestaurantDetailPageComponent
    ],
    exports: [
      RestaurantGridComponent,
      RestaurantAboutComponent
    ],
    entryComponents: [WarningDialogComponent]
})
export class RestaurantModule { }
