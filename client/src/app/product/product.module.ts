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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    ProductRoutingModule,
    SharedModule,
    CartModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    ProductListComponent,
    ProductSpecificationComponent
  ],
  exports: [
    ProductListComponent,
    ProductSpecificationComponent,
    WarningDialogComponent
  ],
  providers: [
  ],
  entryComponents: [WarningDialogComponent]
})
export class ProductModule { }
