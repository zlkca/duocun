import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

import { NgReduxModule, NgRedux } from '@angular-redux/store';
import { rootReducer, INITIAL_STATE } from './store';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { MyAddressComponent } from './page/my-address/my-address.component';
import { HomeComponent } from './page/home/home.component';

import { LoginFormComponent } from './account/login-form/login-form.component';
import { SignupComponent } from './account/signup/signup.component';
import { InstitutionSignupComponent } from './account/institution-signup/institution-signup.component';
import { InstitutionLoginComponent } from './account/institution-login/institution-login.component';
import { ForgetPasswordComponent } from './account/forget-password/forget-password.component';

import { RestaurantComponent } from './page/restaurant/restaurant.component';

import { ProductListComponent } from './product/product-list/product-list.component';
import { ProductComponent } from './main/product/product.component';
import { MyOrderComponent } from './page/my-order/my-order.component';

import { CoreModule } from './core/core.module';
import { AccountModule } from './account/account.module';
import { MainModule } from './main/main.module';
import { AdminModule } from './admin/admin.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { ProductModule } from './product/product.module';

import { SharedModule } from './shared/shared.module';

import { AdminComponent } from './admin/admin.component';

import { AdminProductPageComponent } from './admin/admin-product-page/admin-product-page.component';
import { AdminProductFormPageComponent } from './admin/admin-product-form-page/admin-product-form-page.component';
import { AdminAccountPageComponent } from './admin/admin-account-page/admin-account-page.component';
import { OrderModule } from './order/order.module';
import { PageModule } from './page/page.module';

import { environment } from '../environments/environment';
import { SDKBrowserModule, LoopBackConfig } from './lb-sdk';

const appRoutes: Routes = [
    { path: 'admin', component: AdminComponent },
    // { path: 'admin/restaurant/:id', component: AdminRestaurantFormPageComponent },
    // { path: 'admin/restaurant', component: AdminRestaurantFormPageComponent },
    { path: 'admin/products/:id', component: AdminProductFormPageComponent },
    { path: 'admin/product', component: AdminProductFormPageComponent },
    { path: 'admin/products', component: AdminProductPageComponent },
    { path: 'admin/user', component: AdminAccountPageComponent },
    { path: 'admin/users/:id', component: AdminAccountPageComponent },
    { path: 'admin/orders', component: AdminComponent },

    { path: 'restaurants/:id', component: RestaurantComponent },
    // { path: 'restaurant-detail/:id', component: RestaurantDetailComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'product/:id', component: ProductComponent },
    { path: 'orders', component: MyOrderComponent },
    { path: 'forget-password', component: ForgetPasswordComponent },
    { path: 'login', component: LoginFormComponent },
    { path: 'institution-login', component: InstitutionLoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'institution-signup', component: InstitutionSignupComponent },
    { path: 'home', component: HomeComponent },
    { path: 'my-address', component: MyAddressComponent },
    { path: '', component: MyAddressComponent}
];



@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        CoreModule,
        FormsModule,
        RouterModule.forRoot(
            appRoutes,
            {useHash: true}
            // { enableTracing: true } // <-- debugging purposes only
        ),
        SDKBrowserModule.forRoot(), // for socket
        NgbModule.forRoot(),
        NgReduxModule,
        SharedModule,
        AccountModule,
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
