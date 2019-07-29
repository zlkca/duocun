import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactRoutingModule } from './contact-routing.module';
import { ReactiveFormsModule } from '../../../node_modules/@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LocationModule } from '../location/location.module';
import { LocationService } from '../location/location.service';
import { AccountService } from '../account/account.service';
import { PhoneFormPageComponent } from './phone-form-page/phone-form-page.component';
import { MatSnackBarModule, MatFormFieldModule, MatInputModule } from '../../../node_modules/@angular/material';
import { MatStepperModule } from '@angular/material/stepper';

import { DistanceService } from '../location/distance.service';
import { AddressFormPageComponent } from './address-form-page/address-form-page.component';
import { PhoneService } from './phone.service';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { PhoneFormComponent } from './phone-form/phone-form.component';
import { AddressFormComponent } from './address-form/address-form.component';
import { MallService } from '../mall/mall.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    ContactRoutingModule,
    SharedModule,
    LocationModule
  ],
  declarations: [
    PhoneFormPageComponent,
    AddressFormPageComponent,
    ContactPageComponent,
    PhoneFormComponent,
    AddressFormComponent
  ],
  providers: [
    LocationService,
    AccountService,
    DistanceService,
    PhoneService,
    MallService,
    DistanceService
  ]
})
export class ContactModule { }
