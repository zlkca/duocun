import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactRoutingModule } from './contact-routing.module';
import { ContactFormPageComponent } from './contact-form-page/contact-form-page.component';
import { ContactListPageComponent } from './contact-list-page/contact-list-page.component';
import { ReactiveFormsModule } from '../../../node_modules/@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LocationModule } from '../location/location.module';
import { LocationService } from '../location/location.service';
import { AccountService } from '../account/account.service';
import { DeliveryDateListPageComponent } from './delivery-date-list-page/delivery-date-list-page.component';
import { PhoneFormPageComponent } from './phone-form-page/phone-form-page.component';
import { MatSnackBarModule } from '../../../node_modules/@angular/material';

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
    ContactListPageComponent,
    DeliveryDateListPageComponent,
    PhoneFormPageComponent
  ],
  providers: [
    LocationService,
    AccountService
  ]
})
export class ContactModule { }
