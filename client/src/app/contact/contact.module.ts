import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactRoutingModule } from './contact-routing.module';
import { ContactFormPageComponent } from './contact-form-page/contact-form-page.component';
import { ReactiveFormsModule } from '../../../node_modules/@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LocationModule } from '../location/location.module';
import { LocationService } from '../location/location.service';
import { AccountService } from '../account/account.service';
import { PhoneFormPageComponent } from './phone-form-page/phone-form-page.component';
import { MatSnackBarModule } from '../../../node_modules/@angular/material';
import { DistanceService } from '../location/distance.service';
import { AddressFormPageComponent } from './address-form-page/address-form-page.component';

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
    ContactFormPageComponent,
    PhoneFormPageComponent,
    AddressFormPageComponent
  ],
  providers: [
    LocationService,
    AccountService,
    DistanceService
  ]
})
export class ContactModule { }
