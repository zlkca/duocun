import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { AuthService } from '../auth.service';
import { AccountService } from '../account.service';
import { Account } from '../../account/account.model';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';

@Component({
  providers: [AuthService],
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  errMsg: string;
  form: FormGroup;

  constructor(private fb: FormBuilder,
    private accountSvc: AccountService,
    private authSvc: AuthService,
    private router: Router,
    private rx: NgRedux<IAppState>,
  ) {

    this.form = this.fb.group({
      username: ['', Validators.required],
      // email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: {name: 'login'}
    });
  }

  validate(s) {
    const format = /[()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    if (format.test(s)) {
      return false;
    } else {
      return true;
    }
  }

  onSignup() {
    const v = this.form.value;
    const account = new Account({
      username: v.username,
      email: '', // v.email,
      password: v.password,
      type: 'user'
    });
    this.authSvc.removeCookies();

    if (this.form.invalid) {
      this.errMsg = 'FieldEmpty';
    } else if (this.validate(v.username)) {
      this.errMsg = 'InvalidChar';
    } else {
      this.accountSvc.signup(account).subscribe((user: Account) => {
        if (user && user.id) {
          if (user.type === 'user') {
            this.router.navigate(['main/home']);
          } else if (user.type === 'worker') {
            this.router.navigate(['order/list-worker']);
          }
        } else {
          this.errMsg = 'UserExist';
        }
      },
      err => {
        console.log(err.message);
        this.errMsg = 'UserExist';
      });
    }
  }

  onFocusUsername(e) {
    this.errMsg = '';
  }

  onFocusPassword(e) {
    this.errMsg = '';
  }

}
