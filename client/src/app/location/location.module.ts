import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationListComponent } from './location-list/location-list.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    LocationListComponent
  ],
  exports: [
    LocationListComponent
  ]
})
export class LocationModule { }
