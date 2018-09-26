import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommerceModule } from '../commerce/commerce.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { AccountModule } from '../account/account.module';
import { ProductModule } from '../product/product.module';
import { AdminComponent } from './admin.component';
import { AdminProductListComponent } from './admin-product-list/admin-product-list.component';
import { AdminProductFormPageComponent } from './admin-product-form-page/admin-product-form-page.component';


import { AdminBusinessUserFormComponent } from './admin-business-user-form/admin-business-user-form.component';
import { AdminBusinessUserFormPageComponent } from './admin-business-user-form-page/admin-business-user-form-page.component';

import { AdminRestaurantFormPageComponent } from './admin-restaurant-form-page/admin-restaurant-form-page.component';
import { AdminBusinessUserListComponent } from './admin-business-user-list/admin-business-user-list.component';
import { AdminRestaurantPageComponent } from './admin-restaurant-page/admin-restaurant-page.component';
import { AdminOrderListComponent } from './admin-order-list/admin-order-list.component';
import { AdminProductPageComponent } from './admin-product-page/admin-product-page.component';
import { EditRestaurantComponent } from './edit-restaurant/edit-restaurant.component';
import { AdminCategoryPageComponent } from './admin-category-page/admin-category-page.component';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        RestaurantModule,
        AccountModule,
        ProductModule,
        CommerceModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [AdminComponent,
        AdminBusinessUserListComponent,
        AdminBusinessUserFormComponent,
        AdminBusinessUserFormPageComponent,
        AdminRestaurantFormPageComponent,
        AdminProductListComponent,
        AdminRestaurantPageComponent,
        AdminOrderListComponent,
        AdminProductPageComponent,
        AdminProductFormPageComponent,
        EditRestaurantComponent,
        AdminCategoryPageComponent
      ],
    exports: [AdminComponent, EditRestaurantComponent]
})
export class AdminModule { }
