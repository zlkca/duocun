import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MallFormComponent } from './mall-form/mall-form.component';
import { MallListComponent } from './mall-list/mall-list.component';
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
    MallFormComponent,
    MallListComponent]
})
export class MallModule { }
