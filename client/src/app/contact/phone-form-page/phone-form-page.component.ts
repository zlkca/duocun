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
import { ILocation } from '../../location/location.model';
import { IDelivery } from '../../delivery/delivery.model';

@Component({
  selector: 'app-phone-form-page',
  templateUrl: './phone-form-page.component.html',
  styleUrls: ['./phone-form-page.component.scss']
})
export class PhoneFormPageComponent implements OnInit, OnDestroy {
  account;
  form;
  contact: Contact;
  phoneVerified = true;
  onDestroy$ = new Subject<any>();
  bGettingCode = false;
  counter = 60;
  countDown;
  fromPage;
  location;

  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    private contactSvc: ContactService,
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
      payload: 'phone-form'
    });

    this.fromPage = this.route.snapshot.queryParamMap.get('fromPage');
  }

  ngOnInit() {
    const self = this;

    this.accountSvc.getCurrent().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(account => {
      self.account = account;
    });

    this.rx.select('contact').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((contact: IContact) => {
      if (contact) {
        this.contact = new Contact(contact);
        if (!contact.phone) {
          this.phoneVerified = false;
        }
        this.form.patchValue(contact);
      }
    });

    this.rx.select('delivery').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((d: IDelivery) => {
      self.location = d.origin;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onPhoneChange(e) {
    this.phoneVerified = false;
  }

  onVerificationCodeInput(e) {
    const self = this;
    if (e.target.value && e.target.value.length === 4) {
      const code = e.target.value;
      this.contactSvc.verifyCode(code, this.account.id).subscribe(verified => {
        this.phoneVerified = verified;
        if (verified) {
          if (self.countDown) {
            clearInterval(self.countDown);
          }
          setTimeout(() => {
            self.save();
          }, 1200);
        }
      });
    }
  }

  cancel() {
    const self = this;
    const phone = Cookies.get('duocun-old-phone');
    if (!this.contact) {
      this.contact = new Contact();
    }
    this.contact.phone = phone;

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE,
      payload: this.contact
    });
    Cookies.remove('duocun-old-phone');

    if (this.fromPage === 'account-setting') {
      this.router.navigate(['account/setting']);
    } else if (this.fromPage === 'restaurant-detail') {
      this.router.navigate(['order/form']);
    }
  }

  save() {
    const self = this;
    const v = this.form.value;

    if (!this.phoneVerified) {
      return;
    }

    this.contactSvc.find({ where: { accountId: this.account.id } }).subscribe(oldContacts => {
      if (oldContacts && oldContacts.length > 0) {
        const oldContact = oldContacts[0];
        oldContact.phone = v.phone;
        oldContact.verificationCode = v.verificationCode;

        // replace phone number only
        self.contactSvc.replace(oldContact).subscribe(x => {
          if (self.fromPage === 'account-setting') {
            self.rx.dispatch<IContactAction>({
              type: ContactActions.UPDATE,
              payload: oldContact
            });
            self.router.navigate(['account/setting']);
            self.snackBar.open('', '默认手机号已成功修改。', {duration: 1000});
          } else if (self.fromPage === 'restaurant-detail') {
            x.location = self.contact.location; // update address for the order
            self.rx.dispatch<IContactAction>({
              type: ContactActions.UPDATE,
              payload: x
            });
            self.router.navigate(['order/form']);
            self.snackBar.open('', '默认手机号已成功保存。', {duration: 1000});
          }
        });
      } else {
        const contact = new Contact();
        contact.accountId = self.account.id;
        contact.username = self.account.username;
        contact.phone = v.phone;
        contact.verificationCode = v.verificationCode;

        self.contactSvc.save(contact).subscribe(x => {
          if (self.fromPage === 'account-setting') {
            self.rx.dispatch<IContactAction>({
              type: ContactActions.UPDATE,
              payload: x
            });
            self.router.navigate(['account/setting']);
            self.snackBar.open('', '默认手机号已成功保存。', {duration: 1000});
          } else if (self.fromPage === 'restaurant-detail') {
            x.location = self.location;
            self.rx.dispatch<IContactAction>({
              type: ContactActions.UPDATE,
              payload: x
            });
            self.router.navigate(['order/form']);
            self.snackBar.open('', '默认手机号已成功保存。', {duration: 1000});
          }
        });
      }
    });
  }

  sendVerify() {
    const self = this;
    let phone: string = this.form.value.phone;

    if (phone) {
      phone = phone.match(/\d+/g).join('');
      const contact = { phone: phone, accountId: self.account.id };
      this.bGettingCode = true;
      this.counter = 60;
      this.countDown = setInterval(function () {
        self.counter--;
        if (self.counter === 0) {
          clearInterval(self.countDown);
          self.bGettingCode = false;
        }
      }, 1000);
      this.contactSvc.sendVerifyMessage(contact).subscribe(x => {
        this.snackBar.open('', '短信验证码已发送', {
          duration: 1000
        });
      });
    }
  }

  // verify(code: string, accountId: string) {
  //   const v = this.form.value;
  //   this.contactSvc.verifyCode(code, accountId).subscribe(verified => {
  //     this.phoneVerified = verified;
  //     if (verified) {
  //       this.router.navigate(['contact/list']);
  //     }
  //   });
  // }
}
