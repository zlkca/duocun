import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { NgReduxModule, NgRedux } from '@angular-redux/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { rootReducer, INITIAL_STATE } from './store';
// import { NgxPaginationModule } from 'ngx-pagination';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';

import { AuthService } from './account/auth.service';
import { HttpClientModule } from '../../node_modules/@angular/common/http';
import { EntityService } from './entity.service';
import { AccountService } from './account/account.service';
import { ContactService } from './contact/contact.service';
import { CartModule } from './cart/cart.module';

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
    AppComponent
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
    // StoreModule.forRoot({ rootReducer }),
    // StoreDevtoolsModule.instrument({
    //   maxAge: 10
    // })
    // NgxPaginationModule
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
    // CartModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
  providers: [
    EntityService,
    AuthService,
    AccountService,
    ContactService
  ]

})
export class AppModule {
  constructor(ngRedux: NgRedux<any>) {
    ngRedux.configureStore(rootReducer, INITIAL_STATE);
  }
}
