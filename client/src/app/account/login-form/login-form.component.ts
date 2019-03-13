import { Component, Output, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';

import { AuthService } from '../auth.service';
import { SharedService } from '../../shared/shared.service';

import { AccountService } from '../account.service';
import { AccountActions } from '../account.actions';
import { Account } from '../../lb-sdk';


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
      private ngRedux: NgRedux<Account>,
    ) {
        this.form = this.fb.group({
            account: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    ngOnInit() {
        // let self = this;

        // self.authServ.getUser({'email':r.email}).subscribe(
        //   (user:any)=>{
        //     if(user){
        //       self.authServ.setLogin(user);
        //       self.pageServ.emitMsg({name:'OnUpdateHeader'});
        //       self.user = user;
        //       self.toHome();
        //     }else{

        //       self.authServ.signup(r.username, r.email, '', 'member', 'm', r.firstname, r.lastname, r.portrait)
        //         .subscribe(function(user){
        //           self.authServ.setLogin(user);
        //           self.msgServ.emit({name:'OnUpdateHeader'});
        //           self.user = user;
        //           self.toHome();
        //         }, function(err){
        //           let e = err;
        //         })
        //     }
        //   },
        //   (error:any)=>{

        //   });
        //   }

    }

    onLogin() {
      const self = this;
      const v = this.form.value;
      // if (this.form.valid) {
      this.accountServ.login(v.account, v.password)
        .subscribe((account: Account) => {
          self.ngRedux.dispatch({ type: AccountActions.UPDATE, payload: account }); // update header, footer icons

          if (account.type === 'super') {
            this.router.navigate(['admin']);
          } else {
            this.router.navigate(['my-address']);
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

