import { Component, Output, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';

import { AuthService } from '../auth.service';
import { AccountService } from '../account.service';
import { AccountActions } from '../account.actions';
import { Account } from '../../lb-sdk';
import { PageActions } from '../../page/page.actions';
import { IAppState } from '../../store';


@Component({
    providers: [AuthService],
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
    public user;
    public account = '';
    public password = '';

    token = '';
    errMsg = '';
    auth2: any;
    form: FormGroup;

    constructor(
      private fb: FormBuilder,
      private authServ: AuthService,
      private router: Router,
      private accountServ: AccountService,
      private rx: NgRedux<IAppState>,
    ) {
        this.form = this.fb.group({
            account: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    ngOnInit() {
      this.rx.dispatch({
        type: PageActions.UPDATE_URL,
        payload: 'login'
      });
    }

    onLogin() {
      const self = this;
      const v = this.form.value;
      // if (this.form.valid) {
      this.accountServ.login(v.account, v.password)
        .subscribe((account: Account) => {
          self.rx.dispatch({ type: AccountActions.UPDATE, payload: account }); // update header, footer icons

          if (account.type === 'super') {
            this.router.navigate(['admin']);
          } else {
            if (account.type === 'user') {
              this.router.navigate(['home']);
            } else if (account.type === 'worker') {
              this.router.navigate(['worker-orders']);
            }
          }
        },
          (error) => {
            this.errMsg = error.message || 'login failed.';
            console.error('An error occurred', error);
          });
    }
    onForgetPassword() {
        // this.router.navigate(["/forget-password"]);;
        // return false;
    }

    onChangeAccount() {
        this.errMsg = "";
    }

    onChangePassword() {
        this.errMsg = "";
    }


    toPage(page: string) {
        this.router.navigate([page]);
    }

}

