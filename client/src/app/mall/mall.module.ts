import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '../../../node_modules/@angular/forms';
import { MallService } from './mall.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    MallService,
  ],
  declarations: [
  ]
})
export class MallModule { }
