
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


import { WizardComponent } from './wizard/wizard.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { MapComponent } from './map/map.component';
// import { HeaderComponent } from './header/header.component';
// import { FooterComponent } from './footer/footer.component';
// import { MultiImageUploaderComponent } from './multi-image-uploader/multi-image-uploader.component';
// import { LocationService } from './location/location.service';
import { SharedService } from './shared.service';
import { AddressAutocompleteComponent } from './address-autocomplete/address-autocomplete.component';
import { EntityService } from '../entity.service';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component';
import { DeliveryDateListComponent } from './delivery-date-list/delivery-date-list.component';
import { AddressInputComponent } from './address-input/address-input.component';

// import { PageService } from '../pages/page.service';
// import { PagesModule } from '../pages/pages.module';
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
    WizardComponent,
    ImageViewerComponent,
    FeedbackComponent,
    MapComponent,
    // HeaderComponent,
    // FooterComponent,
    AddressAutocompleteComponent,
    WarningDialogComponent,
    DeliveryDateListComponent,
    AddressInputComponent
  ],
  providers: [
    SharedService,
    EntityService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    WizardComponent, ImageViewerComponent, FeedbackComponent,
    MapComponent,
    // HeaderComponent,
    // FooterComponent,
    AddressAutocompleteComponent,
    WarningDialogComponent,
    DeliveryDateListComponent,
    AddressInputComponent
  ]
})
export class SharedModule { }
