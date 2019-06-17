import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductGridComponent } from './product-grid/product-grid.component';
import { ProductRoutingModule } from './product-routing.module';
import { WarningDialogComponent } from '../shared/warning-dialog/warning-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProductRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    ProductListComponent,
    ProductGridComponent
  ],
  exports: [ProductListComponent, ProductGridComponent, WarningDialogComponent
  ],
  providers: [
  ],
  entryComponents: [WarningDialogComponent]
})
export class ProductModule { }
