
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';


import { WizardComponent } from './wizard/wizard.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { MapComponent } from './map/map.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AddressInputComponent } from './address-input/address-input.component';
import { MultiImageUploaderComponent } from './multi-image-uploader/multi-image-uploader.component';
import { LocationService } from './location/location.service';
import { SharedService } from './shared.service';

// import { PageService } from '../pages/page.service';
// import { PagesModule } from '../pages/pages.module';
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule
  ],
  declarations: [
    WizardComponent,
    ImageViewerComponent,
    FeedbackComponent,
    MapComponent,
    HeaderComponent,
    FooterComponent,
    AddressInputComponent,
    MultiImageUploaderComponent
  ],
  providers: [LocationService, SharedService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    WizardComponent, ImageViewerComponent, FeedbackComponent,
    MapComponent, HeaderComponent, FooterComponent,
    AddressInputComponent, MultiImageUploaderComponent
  ]
})
export class SharedModule { }
