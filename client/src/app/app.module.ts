import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

import { NgReduxModule, NgRedux } from '@angular-redux/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { rootReducer, INITIAL_STATE } from './store';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';

import { AuthService } from './account/auth.service';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HttpClientModule } from '../../node_modules/@angular/common/http';
import { EntityService } from './entity.service';
import { createStore } from '../../node_modules/redux';


const appRoutes: Routes = [
    {
      path: 'location',
      loadChildren: './location/location.module#LocationModule'
    },
    {
      path: 'area',
      loadChildren: './area/area.module#AreaModule'
    },
    {
      path: 'payment',
      loadChildren: './payment/payment.module#PaymentModule'
    },
    {
      path: 'cart',
      loadChildren: './cart/cart.module#CartModule'
    },
    {
      path: 'restaurant',
      loadChildren: './restaurant/restaurant.module#RestaurantModule'
    },
    {
      path: 'product',
      loadChildren: './product/product.module#ProductModule'
    },
    {
      path: 'merchant',
      loadChildren: './merchant/merchant.module#MerchantModule'
    },
    {
      path: 'order',
      loadChildren: './order/order.module#OrderModule'
    },
    {
      path: 'delivery',
      loadChildren: './delivery/delivery.module#DeliveryModule'
    },
    {
      path: 'contact',
      loadChildren: './contact/contact.module#ContactModule'
    },
    {
      path: 'account',
      loadChildren: './account/account.module#AccountModule'
    },
    {
      path: 'main',
      loadChildren: './main/main.module#MainModule'
    },
    {
      path: '',
      loadChildren: './main/main.module#MainModule'
    },
];



@NgModule({
    declarations: [
      AppComponent,
      HeaderComponent,
      FooterComponent
    ],
    imports: [
        BrowserModule,
        CoreModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot(
            appRoutes,
            // { enableTracing: true } // <-- debugging purposes only
        ),
        NgReduxModule,
        BrowserAnimationsModule,

        // SharedModule,
        // MainModule,
        // AccountModule,
        // SharedModule,
        // AdminModule,
        // RestaurantModule,
        // ProductModule,
        // OrderModule,
        // PageModule,
        // LocationModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
    providers: [
      EntityService,
      AuthService
    ]

})
export class AppModule {
    constructor(ngRedux: NgRedux<any>) {
        ngRedux.configureStore(rootReducer, INITIAL_STATE);
   }
}
