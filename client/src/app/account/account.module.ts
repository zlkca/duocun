import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { LoginFormComponent } from './login-form/login-form.component';
import { SignupComponent } from './signup/signup.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
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

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatTableModule,
        MatSortModule,
        AccountRoutingModule,
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
    ],
    declarations: [
      LoginFormComponent,
      SignupComponent,
      ChangePasswordComponent,
      ForgetPasswordComponent,
      ProfileFormComponent,
      AccountPageComponent,
      BalancePageComponent
    ],
    providers: [
      AccountService,
      AuthService,
      BalanceService,
      PaymentService,
      OrderService,
      TransactionService
    ]
})
export class AccountModule { }
