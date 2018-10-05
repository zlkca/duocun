import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgReduxModule, NgRedux } from '@angular-redux/store';
import { rootReducer, IAppState, INITIAL_STATE } from './store';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';

import { MyAddressComponent } from './page/my-address/my-address.component';
import { HomeComponent } from './page/home/home.component';


// import { ContactComponent } from './main/contact/contact.component';
import { LoginComponent } from './account/login/login.component';
import { SignupComponent } from './account/signup/signup.component';
import { InstitutionSignupComponent } from './account/institution-signup/institution-signup.component';
import { InstitutionLoginComponent } from './account/institution-login/institution-login.component';
import { ForgetPasswordComponent } from './account/forget-password/forget-password.component';

// import { ProfileComponent } from './users/profile/profile.component';
// import { ProfileEditComponent } from './users/profile-edit/profile-edit.component';
// import { ChangePasswordComponent } from './users/change-password/change-password.component';
// import { PaymentComponent } from './products/payment/payment.component';
import { RestaurantDetailComponent } from './restaurant/restaurant-detail/restaurant-detail.component';
import { AdminRestaurantFormPageComponent } from './admin/admin-restaurant-form-page/admin-restaurant-form-page.component';

import { ProductListComponent } from './product/product-list/product-list.component';
import { ProductComponent } from './main/product/product.component';
import { MyOrderComponent } from './page/my-order/my-order.component';

import { CoreModule } from './core/core.module';

// import { MainModule } from './main/main.module';
// import { ProductsModule } from './products/products.module';
import { AccountModule } from './account/account.module';
import { MainModule } from './main/main.module';
import { AdminModule } from './admin/admin.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { ProductModule } from './product/product.module';

import { SharedModule } from './shared/shared.module';
import { CommerceModule } from './commerce/commerce.module';

import { AdminComponent } from './admin/admin.component';

import { AdminProductPageComponent } from './admin/admin-product-page/admin-product-page.component';
import { AdminProductFormPageComponent } from './admin/admin-product-form-page/admin-product-form-page.component';

import { LayoutComponent } from './main/layout/layout.component';

import { AdminAccountPageComponent } from './admin/admin-account-page/admin-account-page.component';
// import { AdminCategoryPageComponent } from './admin/admin-category-page/admin-category-page.component';
import { MultiProductFormComponent } from './commerce/multi-product-form/multi-product-form.component';
import { OrderModule } from './order/order.module';
import { PageModule } from './page/page.module';

import { ImageUploadModule } from 'angular2-image-upload';
import { SDKBrowserModule, LoopBackConfig } from './shared/lb-sdk';

import { environment } from '../environments/environment';

const appRoutes: Routes = [
    { path: 'admin', component: AdminComponent },
    { path: 'admin/restaurant/:id', component: AdminRestaurantFormPageComponent },
    { path: 'admin/restaurant', component: AdminRestaurantFormPageComponent },
    { path: 'admin/products/:id', component: AdminProductFormPageComponent },
    { path: 'admin/product', component: AdminProductFormPageComponent },
    { path: 'admin/products', component: AdminProductPageComponent },
    { path: 'admin/edit-products', component: MultiProductFormComponent },
    { path: 'admin/user', component: AdminAccountPageComponent },
    { path: 'admin/users/:id', component: AdminAccountPageComponent },
    { path: 'admin/orders', component: AdminComponent },

    { path: 'restaurants', component: HomeComponent },
    { path: 'restaurant-detail/:id', component: RestaurantDetailComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'product/:id', component: ProductComponent },
    { path: 'orders', component: MyOrderComponent },
    { path: 'forget-password', component: ForgetPasswordComponent },
    { path: 'login', component: LoginComponent },
    { path: 'institution-login', component: InstitutionLoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'institution-signup', component: InstitutionSignupComponent },
    { path: 'home', component: MyAddressComponent },
    { path: '', component: MyAddressComponent}
];



@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        CoreModule,
        HttpClientModule,
        FormsModule,
        RouterModule.forRoot(
            appRoutes,
            {useHash: true}
            // { enableTracing: true } // <-- debugging purposes only
        ),
        SDKBrowserModule.forRoot(),
        ImageUploadModule.forRoot(),
        NgbModule.forRoot(),
        NgReduxModule,
        SharedModule,
        AccountModule,
        CommerceModule,
        MainModule,
        AdminModule,
        RestaurantModule,
        ProductModule,
        OrderModule,
        PageModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],

})
export class AppModule {
    constructor(ngRedux: NgRedux<any>) {
        ngRedux.configureStore(rootReducer, INITIAL_STATE);
        LoopBackConfig.setBaseURL(environment.API_BASE);
        LoopBackConfig.setApiVersion('api');
    }
}
