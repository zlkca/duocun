import { Component, Output, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';

import { User } from '../account';
import { AuthService } from '../auth.service';
import { SharedService } from '../../shared/shared.service';
import { AccountActions } from '../account.actions';
import { AccountService } from '../account.service';
import { Account } from '../../shared/lb-sdk/models/Account';

@Component({
  selector: 'app-institution-login',
  templateUrl: './institution-login.component.html',
  styleUrls: ['./institution-login.component.scss']
})
export class InstitutionLoginComponent implements OnInit {

  errMsg = '';
  form:FormGroup;

  constructor(
    private fb:FormBuilder,
    private authServ:AuthService,
    private accountServ: AccountService,
    private router:Router,
    private sharedServ:SharedService,
    ) {

    this.form = this.fb.group({
      account:['', Validators.required],
      password:['', Validators.required]
    });
  }

  ngOnInit() {}

  onLogin() {
    const v = this.form.value;
    // if (this.form.valid) {
    this.accountServ.login(v.account, v.password)
    .subscribe((account: Account) => {
        if (account.restaurants.length) {
            this.router.navigate(['admin']);
        } else {
            this.router.navigate(['restaurants']);
        }
    },
    (error) => {
        this.errMsg = error.message || 'login failed.';
        console.error('An error occurred', error);
    });
}


  onForgetPassword(){
    // this.router.navigate(["/forget-password"]);;
    // return false;
  }

  toPage(page:string){
    this.router.navigate([page]);
  }
}
