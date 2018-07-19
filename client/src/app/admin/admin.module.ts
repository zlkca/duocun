import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommerceModule } from '../commerce/commerce.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { AccountModule } from '../account/account.module';
import { ProductModule } from '../product/product.module';
import { AdminComponent } from './admin.component';
import { ManageProductListComponent } from './manage-product-list/manage-product-list.component';
import { AdminProductFormPageComponent } from './admin-product-form-page/admin-product-form-page.component';


import { AdminBusinessUserFormComponent } from './admin-business-user-form/admin-business-user-form.component';
import { AdminBusinessUserFormPageComponent } from './admin-business-user-form-page/admin-business-user-form-page.component';

import { AdminRestaurantFormPageComponent } from './admin-restaurant-form-page/admin-restaurant-form-page.component';
import { AdminBusinessUserListComponent } from './admin-business-user-list/admin-business-user-list.component';
import { ManageRestaurantListComponent } from './manage-restaurant-list/manage-restaurant-list.component';
import { ManageOrderListComponent } from './manage-order-list/manage-order-list.component';
import { ManageProductListPageComponent } from './manage-product-list-page/manage-product-list-page.component';
import { EditRestaurantComponent } from './edit-restaurant/edit-restaurant.component';

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
        ManageProductListComponent,
        ManageRestaurantListComponent,
        ManageOrderListComponent,
        ManageProductListPageComponent,
        AdminProductFormPageComponent,
        EditRestaurantComponent],
    exports: [AdminComponent, EditRestaurantComponent]
})
export class AdminModule { }
