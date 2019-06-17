import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactRoutingModule } from './contact-routing.module';
import { ReactiveFormsModule } from '../../../node_modules/@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LocationModule } from '../location/location.module';
import { LocationService } from '../location/location.service';
import { AccountService } from '../account/account.service';
import { PhoneFormPageComponent } from './phone-form-page/phone-form-page.component';
import { MatSnackBarModule } from '../../../node_modules/@angular/material';
import { DistanceService } from '../location/distance.service';
import { AddressFormPageComponent } from './address-form-page/address-form-page.component';
import { PhoneService } from './phone.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    ContactRoutingModule,
    SharedModule,
    LocationModule
  ],
  declarations: [
    PhoneFormPageComponent,
    AddressFormPageComponent
  ],
  providers: [
    LocationService,
    AccountService,
    DistanceService,
    PhoneService
  ]
})
export class ContactModule { }
