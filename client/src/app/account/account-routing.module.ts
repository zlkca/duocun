import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { SignupComponent } from './signup/signup.component';
import { AccountPageComponent } from './account-page/account-page.component';
import { BalancePageComponent } from './balance-page/balance-page.component';
import { AddCreditPageComponent } from './add-credit-page/add-credit-page.component';

const routes: Routes = [
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'add-credit', component: AddCreditPageComponent },
  { path: 'login', component: LoginFormComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'settings', component: AccountPageComponent},
  { path: 'balance', component: BalancePageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
