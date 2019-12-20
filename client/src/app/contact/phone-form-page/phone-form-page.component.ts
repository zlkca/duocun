import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageActions } from '../../main/main.actions';
import { IContact, Contact } from '../contact.model';
import { IContactAction } from '../contact.reducer';
import { ContactActions } from '../contact.actions';
import { ContactService } from '../contact.service';
import { IAppState } from '../../store';
import { AccountService } from '../../account/account.service';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import * as Cookies from 'js-cookie';
import { IDelivery } from '../../delivery/delivery.model';
import { AuthService } from '../../account/auth.service';
import { AccountActions } from '../../account/account.actions';
import { IAccount } from '../../account/account.model';

@Component({
  selector: 'app-phone-form-page',
  templateUrl: './phone-form-page.component.html',
  styleUrls: ['./phone-form-page.component.scss']
})
export class PhoneFormPageComponent implements OnInit, OnDestroy {
  account;
  form;
  contact: Contact;
  onDestroy$ = new Subject<any>();
  bGettingCode = false;
  counter = 60;
  countDown;
  fromPage;
  location;
  accountId; // if there is no account, use this to save temp account generated from backend

  get verificationCode() { return this.form.get('verificationCode'); }

  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    private contactSvc: ContactService,
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

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: { name: 'phone-form' }
    });

    this.fromPage = this.route.snapshot.queryParamMap.get('fromPage');
  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      self.account = account;
    });

    this.rx.select('contact').pipe(takeUntil(this.onDestroy$)).subscribe((contact: IContact) => {
      if (contact) {
        this.contact = new Contact(contact);
        this.contact.verified = false;
        contact.verificationCode = '';
        this.form.patchValue(contact);
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
    this.contact.verified = false;
    this.contact.verificationCode = '';
    this.verificationCode.patchValue('');

    if (e.target.value && e.target.value.length >= 10) {
      if (this.account) {
        // pass
      } else {
        let phone: string = this.form.value.phone;
        phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;
        phone = phone.match(/\d+/g).join('');
        this.accountSvc.find({ phone: phone }).pipe(takeUntil(this.onDestroy$)).subscribe(accounts => {
          if (accounts && accounts.length > 0) {
            this.account = accounts[0];
          }
        });
      }
    }
  }

  onVerificationCodeInput(e) {
    const self = this;
    const accountId = this.account ? this.account._id : this.accountId;
    if (e.target.value && e.target.value.length === 4) {
      const code = e.target.value;
      this.contactSvc.verifyCode(code, accountId).pipe(takeUntil(this.onDestroy$)).subscribe(verified => {
        this.contact.verified = verified;
        if (verified) {
          if (self.countDown) {
            clearInterval(self.countDown);
          }
          setTimeout(() => {
            if (this.account) {
              if (self.contact.verified) {
                self.contactSvc.find({ accountId: accountId }).pipe(takeUntil(self.onDestroy$)).subscribe(contacts => {
                  if (contacts && contacts.length > 0) {
                    self.redirect(contacts[0]);
                  }
                });
              }
            }
          }, 1200);
        }
      });
    }
  }

  cancel() {
    const self = this;
    const phone = Cookies.get('duocun-old-phone');
    if (!self.contact) {
      self.contact = new Contact();
    }
    self.contact.phone = phone;

    self.rx.dispatch<IContactAction>({ type: ContactActions.UPDATE_PHONE_NUM, payload: { phone: phone } });

    Cookies.remove('duocun-old-phone');

    if (self.fromPage === 'account-setting') {
      self.router.navigate(['account/settings']);
    } else if (self.fromPage === 'restaurant-detail' || self.fromPage === 'order-form') {
      self.router.navigate(['order/form']);
    }
  }

  redirect(contact) {
    const self = this;
    if (self.fromPage === 'account-setting') {
      self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: contact });
      self.router.navigate(['account/settings']);
      self.snackBar.open('', '默认手机号已成功修改。', { duration: 1500 });
    } else if (self.fromPage === 'restaurant-detail') {
      // x.location = self.contact.location; // update address for the order
      // self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: oldContact }); // fix me
      self.rx.dispatch<IContactAction>({ type: ContactActions.UPDATE_WITHOUT_LOCATION, payload: contact });
      self.router.navigate(['order/form']);
      self.snackBar.open('', '默认手机号已成功保存。', { duration: 1500 });
    } else if (self.fromPage === 'order-form') {
      self.snackBar.open('', '默认手机号已成功保存。', { duration: 1500 });
      // self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: oldContact }); // fix me
      self.rx.dispatch<IContactAction>({ type: ContactActions.UPDATE_WITHOUT_LOCATION, payload: contact });
      self.router.navigate(['order/form'], { queryParams: { fromPage: 'order-form' } });
    }
  }

  sendVerify() {
    const self = this;
    const accountId: string = self.account ? self.account._id : '';
    const username: string = self.account ? self.account.username : this.form.value.phone;
    let phone: string = this.form.value.phone;
    phone = phone.substring(0, 2) === '+1' ? phone.substring(2) : phone;

    if (phone) {
      phone = phone.match(/\d+/g).join('');
      const contact = { phone: phone, accountId: accountId, username: username };
      this.bGettingCode = true;
      this.counter = 60;
      this.countDown = setInterval(function () {
        self.counter--;
        if (self.counter === 0) {
          clearInterval(self.countDown);
          self.bGettingCode = false;
        }
      }, 1000);

      this.contact.verified = false;
      this.contact.verificationCode = '';
      this.verificationCode.patchValue('');
      this.contactSvc.sendVerifyMsg(contact).pipe(takeUntil(this.onDestroy$)).subscribe((id: string) => {
        this.accountId = id;
        this.snackBar.open('', '短信验证码已发送', { duration: 1000 });
      });
    }
  }

  signup() {
    const self = this;
    const data = {
      _id: this.accountId,
      phone: this.form.value.phone,
      username: this.form.value.phone,
      password: this.form.value.verificationCode,
      type: 'client'
    };

    // token --- { id:x, ttl:n, userId:x }
    this.accountSvc.signup(data).pipe(takeUntil(this.onDestroy$)).subscribe((tokenId: any) => {
      self.authSvc.setAccessTokenId(tokenId);
      self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
        if (account) {
          self.rx.dispatch({ type: AccountActions.UPDATE, payload: account });
          self.contactSvc.find({ accountId: account._id }).pipe(takeUntil(self.onDestroy$)).subscribe(contacts => {
            if (contacts && contacts.length > 0) {
              self.redirect(contacts[0]);
            }
          });
        }
        this.snackBar.open('', 'Signup successful', { duration: 1000 });
      });
    });
  }

  login() {

  }

  hasContact() {

  }
}
