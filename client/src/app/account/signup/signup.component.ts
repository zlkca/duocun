import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { AuthService } from '../auth.service';
import { AccountActions } from '../account.actions';

import { SharedService } from '../../shared/shared.service';
import { AccountService } from '../account.service';
import { Account } from '../../lb-sdk';

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
    private authServ: AuthService,
    private accountServ: AccountService,
    private router: Router,
    private sharedServ: SharedService) {

    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {

  }

  onSignup() {
    const v = this.form.value;
    const account = new Account({
      username: v.username,
      email: v.email,
      password: v.password,
      type: 'user'
    });
    this.accountServ.signup(account).subscribe((user: Account) => {
      if (user.id) {
        if (user.type === 'user') {
          this.router.navigate(['home']);
        } else if (user.type === 'worker') {
          this.router.navigate(['worker-orders']);
        }
      }
    },
    err => {
      this.errMsg = err.message || 'Create Account Failed';
    });
  }

}
