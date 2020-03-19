
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { MapComponent } from './map/map.component';

import { SharedService } from './shared.service';
import { AddressAutocompleteComponent } from './address-autocomplete/address-autocomplete.component';
import { EntityService } from '../entity.service';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component';
import { AddressInputComponent } from './address-input/address-input.component';
import { ProgressSpinnerComponent } from './progress-spinner/progress-spinner.component';
import { LocationService } from '../location/location.service';
import { DateSelectComponent } from './date-select/date-select.component';
import { PaymentSelectComponent } from './payment-select/payment-select.component';
import { VerticalTabComponent } from './vertical-tab/vertical-tab.component';
import { FooterComponent } from './footer/footer.component';
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule
  ],
  declarations: [
    ImageViewerComponent,
    FeedbackComponent,
    MapComponent,
    AddressAutocompleteComponent,
    WarningDialogComponent,
    AddressInputComponent,
    ProgressSpinnerComponent,
    DateSelectComponent,
    PaymentSelectComponent,
    VerticalTabComponent,
    FooterComponent
  ],
  providers: [
    SharedService,
    EntityService,
    LocationService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    ImageViewerComponent,
    FeedbackComponent,
    MapComponent,
    AddressAutocompleteComponent,
    WarningDialogComponent,
    AddressInputComponent,
    ProgressSpinnerComponent,
    DateSelectComponent,
    PaymentSelectComponent,
    VerticalTabComponent,
    FooterComponent
  ]
})
export class SharedModule { }
