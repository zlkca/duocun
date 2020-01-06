import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { Router } from '../../../../node_modules/@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '../../../../node_modules/@angular/material';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { CommandActions } from '../../shared/command.actions';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../account/account.service';
import { IAccount } from '../../account/account.model';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { AuthService } from '../auth.service';

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
  selector: 'app-phone-verify-dialog',
  templateUrl: './phone-verify-dialog.component.html',
  styleUrls: ['./phone-verify-dialog.component.scss']
})
export class PhoneVerifyDialogComponent implements OnInit, OnDestroy {

  account;
  form;
  verified: boolean;
  bGettingCode = false;
  counter = 60;
  countDown;

  get phone() { return this.form.get('phone'); }
  get verificationCode() { return this.form.get('verificationCode'); }

  onDestroy$ = new Subject();
  constructor(
    private authSvc: AuthService,
    private accountSvc: AccountService,
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
    private router: Router,
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
    // const self = this;
    // this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
    //   self.account = account;
    //   if (account) {
    //     self.phone.patchValue(self.account.phone);
    //     self.verificationCode.patchValue('');
    //   }
    // });
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

      if (this.account) {
        this.accountSvc.find({ phone: phone }).pipe(takeUntil(this.onDestroy$)).subscribe(accounts => {
          if (accounts && accounts.length > 0) {
            if (accounts[0]._id !== this.account._id) {
              alert('This phone number has already bind to an account, please try other phone number.');
            } else {
              // valid to bind
            }
          } else {
            // valid to bind
          }
        });
      } else { // did not login yet, should never happend

      }
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
              if (self.account && self.account.type !== 'tmp') {
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
                        self.account = account; // For display signup button
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
        }
      });
    }
  }

  sendVerify() {
    const self = this;
    let phone: string = this.form.value.phone;
    phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;
    phone = phone.match(/\d+/g).join('');

    if (phone) {
      this.accountSvc.find({ phone: phone }).pipe(takeUntil(this.onDestroy$)).subscribe(accounts => {
        if (accounts && accounts.length > 0) {
          if (accounts[0]._id !== this.account._id) {
            alert('This phone number has already bind to an account, please try other phone number.');
          } else { // valid to bind
            this.resendVerify(phone);
          }
        } else { // valid to bind
          this.resendVerify(phone);
        }
      });
    }
  }

  resendVerify(phone: string) {
    const self = this;
    const accountId: string = self.account ? self.account._id : '';
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
        this.snackBar.open('', '短信验证码已发送', { duration: 1000 });
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

  login() {

  }

  hasContact() {
    return this.account && this.account.type !== 'tmp';
  }

  onSignup(): void {
    // const self = this;
    // const orderId = this.data.orderId;
    // if (this.data && orderId) {
    //   if (self.data.paymentMethod === 'card' || self.data.paymentMethod === 'WECHATPAY') {

    //     self.orderSvc.removeById(orderId).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
    //       self.dialogRef.close();
    //       self.snackBar.open('', '订单已删除', { duration: 1000 });

    //       self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } }); // refresh order history
    //       self.snackBar.open('', '余额已处理', { duration: 1000 });
    //       self.router.navigate(['order/history']);

    //     });
    //   } else if (self.data.paymentMethod === 'cash' || self.data.paymentMethod === 'prepaid') { // cash or prepaid
    //     self.orderSvc.removeById(self.data.orderId).pipe(takeUntil(self.onDestroy$)).subscribe(x => {
    //       self.dialogRef.close();
    //       self.snackBar.open('', '订单已删除', { duration: 1000 });

    //       self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'reload-orders', args: null } });
    //       self.snackBar.open('', '余额已处理', { duration: 1000 });
    //       self.router.navigate(['order/history']);

    //     });
    //   }
    // }
  }

}
