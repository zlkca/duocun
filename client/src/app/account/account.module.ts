import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ProfileFormComponent } from './profile-form/profile-form.component';
import { InstitutionSignupComponent } from './institution-signup/institution-signup.component';
import { InstitutionLoginComponent } from './institution-login/institution-login.component';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountFormComponent } from './account-form/account-form.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        HttpClientModule,
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
      AccountListComponent,
      AccountFormComponent
    ],
    declarations: [LoginComponent, SignupComponent, ChangePasswordComponent,
        ForgetPasswordComponent,
        ProfileFormComponent,
        InstitutionSignupComponent,
        InstitutionLoginComponent,
        AccountListComponent,
        AccountFormComponent
    ]
})
export class AccountModule { }
