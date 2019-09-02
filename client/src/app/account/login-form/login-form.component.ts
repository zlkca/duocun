import { Component, Output, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Subject } from 'rxjs';

import { AuthService } from '../auth.service';
import { AccountService } from '../account.service';
import { AccountActions } from '../account.actions';
import { PageActions } from '../../main/main.actions';
import { IAppState } from '../../store';

import { Account } from '../account.model';

@Component({
  providers: [AuthService],
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit, OnDestroy {

  public user;
  // public account = '';
  // public password = '';

  token = '';
  errMsg = '';
  auth2: any;
  form: FormGroup;
  private onDestroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private router: Router,
    private accountSvc: AccountService,
    private rx: NgRedux<IAppState>,
  ) {
    this.form = this.fb.group({
      account: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get account() { return this.form.get('account'); }
  get password() { return this.form.get('password'); }

  ngOnInit() {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: {name: 'login'}
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onLogin() {
    const self = this;
    const v = this.form.value;
    this.authSvc.removeCookies();
    if (this.form.valid) {
      this.accountSvc.login(v.account, v.password).subscribe((data: any) => {
        if (data) {
          self.authSvc.setUserId(data.userId);
          self.authSvc.setAccessToken(data.id);
          self.accountSvc.getCurrentUser().subscribe((account: Account) => {
            if (account) {
              self.rx.dispatch({ type: AccountActions.UPDATE, payload: account }); // update header, footer icons
              if (account.type === 'super') {
                this.router.navigate(['admin']);
              } else if (account.type === 'worker') {
                this.router.navigate(['order/list-worker']);
              } else if (account.type === 'restaurant') {
                this.router.navigate(['order/list-restaurant']);
              } else if (account.type === 'user') {
                this.router.navigate(['main/home']);
              }
            } else {
              this.errMsg = 'Wrong username or password';
              // this.router.navigate(['account/login']);
            }
          },
            (error) => {
              this.errMsg = error.message || 'login failed.';
              console.error('An error occurred', error);
            });
        } else {
          console.log('anonymous try to login ... ');
        }
      });
    } else {
      this.errMsg = 'Wrong username or password';
    }
  }
  onForgetPassword() {
    // this.router.navigate(["/forget-password"]);;
    // return false;
  }

  onChangeAccount(e) {
    this.errMsg = '';
  }

  onChangePassword(e) {
    this.errMsg = '';
  }

  onFocusAccount(e) {
    this.errMsg = '';
  }

  onFocusPassword(e) {
    this.errMsg = '';
  }

  toPage(page: string) {
    this.router.navigate(['account/' + page]);
  }

}

