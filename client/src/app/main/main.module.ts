import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { LocationModule } from '../location/location.module';
import { AccountService } from '../account/account.service';
import { AuthService } from '../account/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RestaurantFilterPageComponent } from './restaurant-filter-page/restaurant-filter-page.component';
import { HomeComponent } from './home/home.component';
import { ReactiveFormsModule } from '../../../node_modules/@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RangeService } from '../range/range.service';
import { RestaurantService } from '../restaurant/restaurant.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainRoutingModule,
    MatSnackBarModule,
    // MatProgressSpinnerModule,
    LocationModule,
    SharedModule,
  ],
  declarations: [
    HomeComponent,
    RestaurantFilterPageComponent,
  ],
  exports: [
  ],
  providers: [
    AccountService,
    AuthService,
    RangeService,
    RestaurantService
  ]
})
export class MainModule { }
