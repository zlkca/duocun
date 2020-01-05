import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageActions } from '../../main/main.actions';
// import { IContact, Contact } from '../contact.model';
// import { IContactAction } from '../contact.reducer';
// import { ContactActions } from '../contact.actions';
// import { ContactService } from '../contact.service';
import { IAppState } from '../../store';
import { AccountService } from '../../account/account.service';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { IDelivery } from '../../delivery/delivery.model';
import { AuthService } from '../../account/auth.service';
import { IAccount } from '../../account/account.model';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-phone-verify-page',
  templateUrl: './phone-verify-page.component.html',
  styleUrls: ['./phone-verify-page.component.scss']
})
export class PhoneVerifyPageComponent implements OnInit, OnDestroy {
  account;
  form;
  // contact: Contact;
  onDestroy$ = new Subject<any>();
  bGettingCode = false;
  counter = 60;
  countDown;

  fromPage: string; // params from previous page
  action: string;   // params from previous page

  location;
  accountId; // if there is no account, use this to save temp account generated from backend
  verified = false;

  get phone() { return this.form.get('phone'); }
  get verificationCode() { return this.form.get('verificationCode'); }

  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    // private contactSvc: ContactService,
    private authSvc: AuthService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    const self = this;
    this.form = this.fb.group({
      phone: [''],
      verificationCode: ['']
    });

    this.fromPage = this.route.snapshot.queryParamMap.get('fromPage');
    this.action = this.route.snapshot.queryParamMap.get('action');

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: { name: 'phone-form' }
    });
  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      self.account = account;
      if (account) {
        self.phone.patchValue(self.account.phone);
        self.verificationCode.patchValue('');
      }
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((d: IDelivery) => {
      self.location = d.origin;
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
      if (this.account) {
        // should never happen
      } else {
        let phone: string = this.form.value.phone;
        phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;
        phone = phone.match(/\d+/g).join('');

        // First time there is not token, api call do not allowed
        // this.accountSvc.find({ phone: phone }).pipe(takeUntil(this.onDestroy$)).subscribe(accounts => {
        //   if (accounts && accounts.length > 0) {
        //     this.account = accounts[0];
        //   } else {
        //     this.account = null;
        //   }
        // });
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
                self.redirect(self.account);
              } else {
                self.accountSvc.loginByPhone(phone, code).pipe(takeUntil(this.onDestroy$)).subscribe((tokenId: string) => {
                  self.authSvc.setAccessTokenId(tokenId);
                  self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
                    if (account) {
                      if (account.type === 'tmp') {
                        self.account = account; // For display signup button
                      } else {
                        self.redirect(account);
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

  cancel() {
    // const self = this;
    // const phone = Cookies.get('duocun-old-phone');
    // if (!self.contact) {
    //   self.contact = new Contact();
    // }
    // self.contact.phone = phone;

    // self.rx.dispatch<IContactAction>({ type: ContactActions.UPDATE_PHONE_NUM, payload: { phone: phone } });

    // Cookies.remove('duocun-old-phone');

    // if (self.fromPage === 'account-setting') {
    //   self.router.navigate(['account/settings']);
    // } else if (self.fromPage === 'restaurant-detail' || self.fromPage === 'order-form') {
    //   self.router.navigate(['order/form']);
    // }
  }

  redirect(account: IAccount) {
    const self = this;
    if (self.fromPage === 'account-setting') {
      // self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: contact });
      self.router.navigate(['account/settings']);
      self.snackBar.open('', '默认手机号已成功修改。', { duration: 1500 });
      // } else if (self.fromPage === 'restaurant-detail') {
      //   if (this.action === 'pay') {
      //     self.router.navigate(['order/form'], { queryParams: { fromPage: this.fromPage, action: 'pay' } });
      //   } else {
      //     // x.location = self.contact.location; // update address for the order
      //     // self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: oldContact }); // fix me
      //     // self.rx.dispatch<IContactAction>({ type: ContactActions.UPDATE_WITHOUT_LOCATION, payload: contact });
      //     self.router.navigate(['order/form']);
      //     self.snackBar.open('', '默认手机号已成功保存。', { duration: 1500 });
      //   }

      // } else if (self.fromPage === 'order-form') {
      //   if (this.action === 'pay') {
      //     self.router.navigate(['order/form'], { queryParams: { fromPage: this.fromPage, action: 'pay' } });
      //   } else {
      //     self.snackBar.open('', '默认手机号已成功保存。', { duration: 1500 });
      //     // self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: oldContact }); // fix me
      //     // self.rx.dispatch<IContactAction>({ type: ContactActions.UPDATE_WITHOUT_LOCATION, payload: contact });
      //     self.router.navigate(['order/form'], { queryParams: { fromPage: 'order-form' } });
      //   }
    } else {
      if (this.action === 'pay') {
        self.router.navigate(['order/form'], { queryParams: { fromPage: 'order-form', action: 'pay' } });
      } else {
        self.snackBar.open('', '默认手机号已成功保存。', { duration: 1500 });
        // self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: oldContact }); // fix me
        // self.rx.dispatch<IContactAction>({ type: ContactActions.UPDATE_WITHOUT_LOCATION, payload: contact });
        self.router.navigate(['order/form'], { queryParams: { fromPage: 'order-form' } });
      }
    }
  }

  sendVerify() {
    const self = this;
    const accountId: string = self.account ? self.account._id : '';
    let phone: string = this.form.value.phone;
    phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;

    if (phone) {
      phone = phone.match(/\d+/g).join('');
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
              self.redirect(account);
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
}
