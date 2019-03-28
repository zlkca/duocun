import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../account/auth.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [AuthService]
})
export class LocationModule { }
