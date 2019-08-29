import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { SharedModule } from '../shared/shared.module';
import { OrderService } from './order.service';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderRoutingModule } from './order-routing.module';
import { OrderFormPageComponent } from './order-form-page/order-form-page.component';
import { AccountService } from '../account/account.service';
import { MatDialogModule } from '../../../node_modules/@angular/material';
import { RemoveOrderDialogComponent } from './remove-order-dialog/remove-order-dialog.component';
import { PaymentService } from '../payment/payment.service';
import { MerchantService } from '../merchant/merchant.service';
import { TransactionService } from '../transaction/transaction.service';
import { MallService } from '../mall/mall.service';

@NgModule({
  imports: [
    CommonModule,
    // NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonToggleModule,
    // MatProgressSpinnerModule,
    OrderRoutingModule,
    SharedModule
  ],
  exports: [
  ],
  providers: [
    OrderService,
    AccountService,
    PaymentService,
    MerchantService,
    TransactionService,
    MallService
  ],
  declarations: [
    OrderHistoryComponent,
    OrderFormPageComponent,
    RemoveOrderDialogComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [RemoveOrderDialogComponent]
})
export class OrderModule { }
