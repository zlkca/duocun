import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Router } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    private contactSvc: ContactService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      phone: [''],
      verificationCode: ['']
    });

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'phone-form'
    });
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
  }

  save() {
    const self = this;

    if (!this.phoneVerified) {
      return;
    }

    const v = this.form.value;
    this.contact.phone = v.phone;
    this.contact.verificationCode = v.verificationCode;

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE,
      payload: this.contact
    });

    this.contactSvc.replace(this.contact).subscribe(x => {
      self.router.navigate(['contact/list']);
    }, err => {
      self.router.navigate(['contact/list']);
    });
  }

  sendVerify() {
    const self = this;
    let phone: string = this.form.value.phone;

    if (phone) {
      phone = phone.match(/\d+/g).join('');
      this.contact.phone = phone;
      this.bGettingCode = true;
      this.counter = 60;
      this.countDown = setInterval(function () {
        self.counter--;
        if (self.counter === 0) {
          clearInterval(self.countDown);
          self.bGettingCode = false;
        }
      }, 1000);
      this.contactSvc.sendVerifyMessage(this.contact).subscribe(x => {
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
