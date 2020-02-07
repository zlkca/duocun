import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '../../../../node_modules/@angular/material';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../account/account.service';
import { IAccount } from '../../account/account.model';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { AuthService } from '../../account/auth.service';

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
  selector: 'app-phone-verify-dialog',
  templateUrl: './phone-verify-dialog.component.html',
  styleUrls: ['./phone-verify-dialog.component.scss']
})
export class PhoneVerifyDialogComponent implements OnInit, OnDestroy {

  account; // current logged in account
  phoneMatchedAccount;
  form;
  verified: boolean;
  bGettingCode = false;
  bAllowVerify = false;
  counter = 60;
  countDown;
  lang = environment.language;

  get phone() { return this.form.get('phone'); }
  get verificationCode() { return this.form.get('verificationCode'); }

  onDestroy$ = new Subject();
  constructor(
    private authSvc: AuthService,
    private accountSvc: AccountService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PhoneVerifyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.form = this.fb.group({
      phone: [''],
      verificationCode: ['']
    });
  }

  ngOnInit() {
    this.account = this.data.account;
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
          if (self.countDown) {
            clearInterval(self.countDown);
          }
          setTimeout(() => {
            if (self.verified) {
              if (self.account && self.account.type !== 'tmp') { // user, client
                // must get updated account data
                self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
                  self.dialogRef.close(account);
                });
              } else {
                self.accountSvc.loginByPhone(phone, code).pipe(takeUntil(this.onDestroy$)).subscribe((tokenId: string) => {
                  self.authSvc.setAccessTokenId(tokenId);
                  self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
                    if (account) {
                      if (account.type === 'tmp') {
                        // self.account = account; // For display signup button
                        self.phoneMatchedAccount = account;
                      } else {
                        self.dialogRef.close(account);
                      }
                    } else {
                      console.log('login failed');
                    }
                  });
                });
              }
            } else {
              // pass
            }
          }, 1200);
        } else {
          // pass
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
    const sentHint = this.lang === 'en' ? 'SMS Verification Code sent' : '短信验证码已发送';
    this.bGettingCode = true;
    this.counter = 60;
    this.countDown = setInterval(function () {
      self.counter--;
      if (self.counter === 0) {
        clearInterval(self.countDown);
        self.bGettingCode = false;
      }
    }, 1000);

    this.verified = false;
    this.verificationCode.patchValue('');

    // First time there is not token, api call do not allowed
    const lang = environment.language;
    this.accountSvc.sendVerifyMsg(accountId, phone, lang).pipe(takeUntil(this.onDestroy$)).subscribe((tokenId: string) => {
      if (tokenId) { // to allow api call
        self.authSvc.setAccessTokenId(tokenId);
      }
      this.snackBar.open('', sentHint, { duration: 1000 });
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
              self.dialogRef.close(account);
              // self.rx.dispatch({ type: AccountActions.UPDATE, payload: account });
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

}
