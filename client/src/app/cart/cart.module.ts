import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartRoutingModule } from './cart-routing.module';
import { CartPageComponent } from './cart-page/cart-page.component';
import { SharedModule } from '../shared/shared.module';
import { AccountService } from '../account/account.service';
import { WarningDialogComponent } from '../shared/warning-dialog/warning-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    CartRoutingModule,
    SharedModule
  ],
  declarations: [CartPageComponent],
  providers: [
    AccountService
  ],
  entryComponents: [WarningDialogComponent]
})
export class CartModule { }
