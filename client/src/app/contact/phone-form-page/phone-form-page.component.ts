import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Router } from '../../../../node_modules/@angular/router';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../account/account.service';
import { IAccount } from '../../account/account.model';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { AuthService } from '../../account/auth.service';
import { PageActions } from '../../main/main.actions';

declare var Stripe;

export interface DialogData {
  title: string;
  content: string;
  buttonTextNo: string;
  buttonTextYes: string;
  account: IAccount;
  orderId: string;
  total: number;
  paymentMethod: string;
  chargeId: string;
  transactionId: string;
}

@Component({
  selector: 'app-phone-form-page',
  templateUrl: './phone-form-page.component.html',
  styleUrls: ['./phone-form-page.component.scss']
})
export class PhoneFormPageComponent implements OnInit, OnDestroy {

  account;
  form;
  verified: boolean;
  bGettingCode = false;
  counter = 60;
  // countDown;
  lang = environment.language;
  phoneMatchedAccount;
  bAllowVerify = false;

  get phone() { return this.form.get('phone'); }
  get verificationCode() { return this.form.get('verificationCode'); }

  onDestroy$ = new Subject();
  constructor(
    private authSvc: AuthService,
    private accountSvc: AccountService,
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      phone: [''],
      verificationCode: ['']
    });
  }

  ngOnInit() {
    // this.account = this.data.account;
    const self = this;

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: { name: 'phone-form', fromPage: 'account-setting' }
    });


    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      self.account = account;
      if (account) {
        self.phone.patchValue(self.account.phone);
        self.verificationCode.patchValue('');
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onPhoneInput(e) {
    this.verified = false;
    this.verificationCode.patchValue('');

    if (e.target.value && e.target.value.length >= 10) {
      let phone: string = this.form.value.phone;
      phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;
      phone = phone.match(/\d+/g).join('');

      this.accountSvc.find({ phone: phone }).pipe(takeUntil(this.onDestroy$)).subscribe(accounts => {
        if (this.account) { // if logged in
          if (accounts && accounts.length > 0) { // db has accounts with this number
            const account: IAccount = accounts[0];
            this.phoneMatchedAccount = account;
            if (account._id !== this.account._id) {
              const hint = this.lang === 'en' ? 'This phone number has already bind to an wechat account, please try use wechat to login.' :
                '该号码已经被一个英文版的账号使用，请使用英文版登陆; 如果想更改账号请联系客服。';
              alert(hint);
              this.bAllowVerify = false;
            } else {
              this.bAllowVerify = true;
            }
          } else {
            this.bAllowVerify = true;
          }
        } else { // did not login yet
          if (accounts && accounts.length > 0) { // db has accounts with this number
            const account: IAccount = accounts[0];
            this.phoneMatchedAccount = account;
            if (this.lang === 'en') {
              if (account.openId) {
                alert('This phone number has already bind to an wechat account, please try use wechat to login.');
                this.bAllowVerify = false;
              } else {
                this.bAllowVerify = true;
              }
            } else {
              if (!account.openId) {
                alert('该号码已经被一个英文版的账号使用，请使用英文版登陆; 如果想更改账号请联系客服。');
                this.bAllowVerify = false;
              } else {
                this.bAllowVerify = true;
              }
            }
          } else {
            this.bAllowVerify = true;
          }
        }
      });
    } else {
      this.bAllowVerify = false;
      this.phoneMatchedAccount = null;
    }
  }

  onVerificationCodeInput(e) {
    const self = this;
    let phone: string = this.form.value.phone;
    phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;
    phone = phone.match(/\d+/g).join('');

    if (e.target.value && e.target.value.length === 4) {
      const code = e.target.value;
      this.accountSvc.verifyCode(phone, code).pipe(takeUntil(this.onDestroy$)).subscribe(verified => {
        this.verified = verified;
        if (verified) {
          // if (self.countDown) {
          //   clearInterval(self.countDown);
          // }
          setTimeout(() => {
            if (self.verified) {
              self.router.navigate(['account/settings']);
            } else {
              // pass
            }
          }, 1200);
        }
      });
    } else {
      this.verified = false;
    }
  }

  sendVerify() {
    if (this.bAllowVerify) {
      let phone: string = this.form.value.phone;
      phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;
      phone = phone.match(/\d+/g).join('');
      this.resendVerify(phone);
    }
  }

  resendVerify(phone: string) {
    const self = this;
    const accountId: string = self.account ? self.account._id : '';
    const successHint = this.lang === 'en' ? 'SMS Verification Code sent' : '短信验证码已发送';
    const failedHint = this.lang === 'en' ? 'Account issue, please contact our customer service。' : '账号有问题，请联系客服';

    this.bGettingCode = true;
      this.counter = 60;
      // this.countDown = setInterval(function () {
        // self.counter--;
        // if (self.counter === 0) {
          // clearInterval(self.countDown);
          self.bGettingCode = false;
        // }
      // }, 1000);

      this.verified = false;
      this.verificationCode.patchValue('');

      // First time there is not token, api call do not allowed
      const lang = environment.language;
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      // First time there is not token, api call do not allowed
      this.accountSvc.sendVerifyMsg(accountId, phone, lang).pipe(takeUntil(this.onDestroy$)).subscribe((tokenId: string) => {
        this.snackBar.open('', successHint, { duration: 1000 });
        this.bGettingCode = true;
        if (tokenId) { // to allow api call
          self.authSvc.setAccessTokenId(tokenId);
        } else {
          alert(failedHint);
        }
        resolve(tokenId);
      });
    });
  }

  signup() {
    const self = this;
    const phone = this.form.value.phone;
    const code = this.form.value.verificationCode;
    if (phone && code) {
      this.accountSvc.signup(phone, code).pipe(takeUntil(this.onDestroy$)).subscribe((tokenId: any) => {
        if (tokenId) {
          self.authSvc.setAccessTokenId(tokenId);
          self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
            if (account) {
            }
            this.snackBar.open('', 'Signup successful', { duration: 1000 });
          });
        } else {

        }
      });
    } else {
      // fail to signup
    }
  }

  login() {

  }

  hasContact() {
    return this.account && this.account.type !== 'tmp';
  }

}
