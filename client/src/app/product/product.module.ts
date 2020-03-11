import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductSpecificationComponent } from './product-specification/product-specification.component';
import { ProductRoutingModule } from './product-routing.module';
import { WarningDialogComponent } from '../shared/warning-dialog/warning-dialog.component';
import { CartModule } from '../cart/cart.module';
import { MerchantService } from '../merchant/merchant.service';
import { MallService } from '../mall/mall.service';
import { ProductSpecConfirmModalComponent } from './product-spec-confirm-modal/product-spec-confirm-modal.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    ProductRoutingModule,
    SharedModule,
    CartModule,
    MatDialogModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    ProductListComponent,
    ProductSpecificationComponent,
    ProductSpecConfirmModalComponent,
  ],
  exports: [
    ProductListComponent,
    ProductSpecificationComponent,
    WarningDialogComponent
  ],
  providers: [
  ],
  entryComponents: [WarningDialogComponent, ProductSpecConfirmModalComponent]
})
export class ProductModule { }
