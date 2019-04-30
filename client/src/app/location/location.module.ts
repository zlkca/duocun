import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationListComponent } from './location-list/location-list.component';
// import { LocationSearchPageComponent } from './location-search-page/location-search-page.component';
import { LocationRoutingModule } from './location-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AccountService } from '../account/account.service';

@NgModule({
  imports: [
    CommonModule,
    LocationRoutingModule,
    SharedModule
  ],
  declarations: [
    LocationListComponent,
    // LocationSearchPageComponent
  ],
  exports: [
    LocationListComponent,
    // LocationSearchPageComponent
  ],
  providers: [
    AccountService
  ]
})
export class LocationModule { }
