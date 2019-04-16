import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { HomeComponent } from './home/home.component';
import { LocationModule } from '../location/location.module';
import { SharedModule } from '../shared/shared.module';
import { AccountService } from '../account/account.service';
import { AuthService } from '../account/auth.service';
import { RestaurantFilterPageComponent } from './restaurant-filter-page/restaurant-filter-page.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule,
    LocationModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  declarations: [
    HomeComponent,
    RestaurantFilterPageComponent
  ],
  exports: [
  ],
  providers: [
    AccountService,
    AuthService
  ]
})
export class MainModule { }
