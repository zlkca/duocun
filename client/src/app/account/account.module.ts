import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { LoginFormComponent } from './login-form/login-form.component';
import { SignupComponent } from './signup/signup.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ProfileFormComponent } from './profile-form/profile-form.component';
import { AccountRoutingModule } from './account-routing.module';
import { AccountService } from './account.service';
import { AuthService } from './auth.service';
import { AccountPageComponent } from './account-page/account-page.component';
import { BalanceService } from '../payment/balance.service';
import { PaymentService } from '../payment/payment.service';
import { BalancePageComponent } from './balance-page/balance-page.component';
import { OrderService } from '../order/order.service';
import { TransactionService } from '../transaction/transaction.service';
import { AddCreditPageComponent } from './add-credit-page/add-credit-page.component';
import { PaginatePipe, NgxPaginationModule } from '../../../node_modules/ngx-pagination';
import { AddressFormDialogComponent } from './address-form-dialog/address-form-dialog.component';
import { PaymentModule } from '../payment/payment.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    NgxPaginationModule,
    AccountRoutingModule,
    SharedModule,
    PaymentModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
  ],
  declarations: [
    LoginFormComponent,
    SignupComponent,
    ForgetPasswordComponent,
    ProfileFormComponent,
    AccountPageComponent,
    BalancePageComponent,
    AddCreditPageComponent,
    AddressFormDialogComponent
  ],
  providers: [
    AccountService,
    AuthService,
    BalanceService,
    PaymentService,
    OrderService,
    TransactionService,
    PaginatePipe
  ]
})
export class AccountModule { }
