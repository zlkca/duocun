import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '../../../../node_modules/@angular/material';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../account/account.service';
import { IAccount } from '../../account/account.model';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { AuthService } from '../../account/auth.service';

export const AccountType = {
  TEMP: 'tmp'
};

export const VerificationError = {
  NONE: 'N',
  WRONG_CODE: 'WC',
  PHONE_NUMBER_OCCUPIED: 'PO',
  REQUIRE_SIGNUP: 'RS',
  NO_PHONE_NUMBER_BIND: 'NP'
};

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
  phoneMatchedAccount; // if phoneMatchedAccount.type === tmp,  display signup button
  form;
  verified: boolean;
  bGettingCode = false;
  bAllowVerify = false;
  // counter = 60;
  // countDown;
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
    const self = this;
    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      self.account = account;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  verifyPhoneNumber(accountId: string, account: IAccount) {
    if (accountId) {
      if (account) {
        // if (account.type === AccountType.TEMP) {
        //   if (accountId === account._id) {
        //     return VerificationError.NONE;
        //   } else {
        //     return VerificationError.PHONE_NUMBER_OCCUPIED;
        //   }
        // } else {
        if (accountId === account._id) {
          return VerificationError.NONE;
        } else {
          return VerificationError.PHONE_NUMBER_OCCUPIED;
        }
        // }
      } else {
        return VerificationError.NONE;
      }
    } else {
      return VerificationError.NONE;
    }
  }

  onPhoneInput(e) {
    const self = this;
    this.verified = false;
    this.verificationCode.patchValue('');

    if (e.target.value && e.target.value.length >= 10) {
      let phone: string = this.form.value.phone;
      phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;
      phone = phone.match(/\d+/g).join('');

      this.accountSvc.find({ phone: phone }).pipe(takeUntil(this.onDestroy$)).subscribe(accounts => {
        const account = (accounts && accounts.length > 0) ? accounts[0] : null;
        const accountId = this.account ? this.account._id : '';
        const err = this.verifyPhoneNumber(accountId, account);

        if (err === VerificationError.PHONE_NUMBER_OCCUPIED) {
          const s = this.lang === 'en' ? 'This phone number has already bind to an wechat account, please try use wechat to login.' :
                '该号码已经被一个英文版的账号使用，请使用英文版登陆; 如果想更改账号请联系客服。';
          alert(s);
          this.bAllowVerify = false;
        } else {
          this.bAllowVerify = true;
        }

        // if (self.account) { // if logged in
        //   if (accounts && accounts.length > 0) { // db has accounts with this number
        //     const account: IAccount = accounts[0];
        //     this.phoneMatchedAccount = account; // if phoneMatchedAccount.type === tmp,  display signup button
        //     if (account._id !== self.account._id) {
        //       const hint = this.lang === 'en' ? 'This phone number has already bind to an wechat account,
        //  please try use wechat to login.' :
        //         '该号码已经被一个英文版的账号使用，请使用英文版登陆; 如果想更改账号请联系客服。';
        //       alert(hint);
        //       this.bAllowVerify = false;
        //     } else {
        //       this.bAllowVerify = true;
        //     }
        //   } else { // there is no account occupy this phone number
        //     this.bAllowVerify = true;
        //   }
        // } else { // did not login yet
        //   if (accounts && accounts.length > 0) { // there is account occupy this phone number
        //     const account: IAccount = accounts[0];
        //     this.phoneMatchedAccount = account; // if phoneMatchedAccount.type === tmp,  display signup button

        //     if (this.lang === 'en') {
        //       if (account.openId) { // weixin occupy this phone number
        //         alert('This phone number has already bind to an wechat account, please try use wechat to login.');
        //         this.bAllowVerify = false;
        //       } else {
        //         this.bAllowVerify = true;
        //       }
        //     } else {
        //       if (!account.openId) { // english account occupy this phone number
        //         alert('该号码已经被一个英文版的账号使用，请使用英文版登陆; 如果想更改账号请联系客服。');
        //         this.bAllowVerify = false;
        //       } else {
        //         this.bAllowVerify = true;
        //       }
        //     }
        //   } else {
        //     this.bAllowVerify = true;
        //   }
        // }
      });
    } else { // input less than 10 chars
      this.bAllowVerify = false;
      this.phoneMatchedAccount = null; // if phoneMatchedAccount.type === tmp,  display signup button
    }
  }

  showError(err) {
    let s = '';
    if (err === VerificationError.PHONE_NUMBER_OCCUPIED) {
      s = this.lang === 'en' ? 'This phone number has already bind to an wechat account, please try use wechat to login.' :
        '该号码已经被一个英文版的账号使用，请使用英文版登陆; 如果想更改账号请联系客服。';
    } else if (err === VerificationError.NO_PHONE_NUMBER_BIND) {
      s = this.lang === 'en' ? 'login with phone number failed, please contact our customer service' :
        '使用该电话号码登陆失败，请联系客服';
    } else if (err === VerificationError.WRONG_CODE) {
      s = this.lang === 'en' ? 'verification code is wrong, please try again.' : '验证码错误，请重新尝试';
    }

    if (s) {
      alert(s);
      // this.snackBar.open('', s, { duration: 1500 });
    }
  }

  onVerificationCodeInput(e) {
    const self = this;
    let phone: string = this.form.value.phone;
    phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;
    phone = phone.match(/\d+/g).join('');

    if (e.target.value && e.target.value.length === 4) {
      const code = e.target.value;
      const accountId = self.account ? self.account._id : '';
      this.accountSvc.verifyAndLogin(phone, code, accountId).pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
        self.verified = r.verified;
        if (r.err === VerificationError.NONE) {
          const account = r.account;
          self.authSvc.setAccessTokenId(r.tokenId);
          self.dialogRef.close(account);
        } else if (r.err === VerificationError.REQUIRE_SIGNUP) {
          self.phoneMatchedAccount = r.account; // display signup button
        } else {
          self.showError(r.err);
        }
      });
      // this.accountSvc.verifyCode(phone, code).pipe(takeUntil(this.onDestroy$)).subscribe(verified => {
      //   this.verified = verified;
      //   if (verified) {
      //     if (self.account && self.account.type !== 'tmp') { // user, client
      //       self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      //         self.dialogRef.close(account);
      //       });
      //     } else {
      //       const hint = this.lang === 'en' ? 'login with phone number failed, please contact our customer service' :
      //         '使用该电话号码登陆失败，请联系客服';

      //       self.accountSvc.loginByPhone(phone, code).pipe(takeUntil(this.onDestroy$)).subscribe((tokenId: string) => {
      //         if (tokenId) {
      //           self.authSvc.setAccessTokenId(tokenId);
      //           self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      //             if (account) {
      //               if (account.type === 'tmp') {
      //                 self.phoneMatchedAccount = account; // if phoneMatchedAccount.type === tmp,  display signup button
      //               } else {
      //                 self.dialogRef.close(account);
      //               }
      //             } else {
      //               alert(hint);
      //             }
      //           });
      //         } else {
      //           alert(hint);
      //         }
      //       });
      //     }
      //   } else {
      //     const hintVerify = this.lang === 'en' ? 'verification code is wrong, please try again.' : '验证码错误，请重新尝试';
      //     alert(hintVerify);
      //   }
      // });
    } else {
      this.verified = false;
    }
  }

  sendVerify() {
    if (this.bAllowVerify) {
      let phone: string = this.form.value.phone;
      phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;
      phone = phone.match(/\d+/g).join('');
      this.resendVerify(phone).then(tokenId => {
      });
    }
  }

  resendVerify(phone: string) {
    const self = this;
    const accountId: string = self.account ? self.account._id : '';
    const successHint = this.lang === 'en' ? 'SMS Verification Code sent' : '短信验证码已发送';
    const failedHint = this.lang === 'en' ? 'Account issue, please contact our customer service。' : '账号有问题，请联系客服';
    const lang = environment.language;

    this.bGettingCode = false;
    this.verified = false;
    this.verificationCode.patchValue('');

    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
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
