import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

import { NgReduxModule, NgRedux } from '@angular-redux/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { rootReducer, INITIAL_STATE } from './store';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ToastrModule } from 'ngx-toastr';

import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';


// import { MainModule } from './main/main.module';
// import { AccountModule } from './account/account.module';
// import { AdminModule } from './admin/admin.module';
// import { RestaurantModule } from './restaurant/restaurant.module';
// import { ProductModule } from './product/product.module';
// import { OrderModule } from './order/order.module';
// import { PageModule } from './page/page.module';
// import { LocationModule } from './location/location.module';

import { environment } from '../environments/environment';
import { SDKBrowserModule, LoopBackConfig } from './lb-sdk';
import { AuthService } from './account/auth.service';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AccountService } from './account/account.service';


const appRoutes: Routes = [

    // { path: 'restaurant-detail/:id', component: RestaurantDetailComponent },


    // { path: 'restaurants/:id', component: RestaurantDetailPageComponent},
    {
      path: 'admin',
      loadChildren: './admin/admin.module#AdminModule'
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
        RouterModule.forRoot(
            appRoutes,
            {useHash: true}
            // { enableTracing: true } // <-- debugging purposes only
        ),
        SDKBrowserModule.forRoot(), // for socket
        NgbModule.forRoot(),
        NgReduxModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({timeOut: 10000,
          positionClass: 'toast-bottom-right',
          preventDuplicates: true
        }),
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
      AuthService,
      AccountService
    ]

})
export class AppModule {
    constructor(ngRedux: NgRedux<any>) {
        ngRedux.configureStore(rootReducer, INITIAL_STATE);
        LoopBackConfig.setBaseURL(environment.API_BASE);
        LoopBackConfig.setApiVersion('api');
    }
}
