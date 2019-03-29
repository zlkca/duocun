import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../account/auth.service';
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
  ],
  providers: [AuthService]
})
export class LocationModule { }
