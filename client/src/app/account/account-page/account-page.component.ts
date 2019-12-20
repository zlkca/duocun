import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '../account.service';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { Router } from '@angular/router';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { IContact, Contact } from '../../contact/contact.model';
import { Subject } from '../../../../node_modules/rxjs';
import { ContactService } from '../../contact/contact.service';
import { IContactAction } from '../../contact/contact.reducer';
import { ContactActions } from '../../contact/contact.actions';
import * as Cookies from 'js-cookie';
import { PageActions } from '../../main/main.actions';
import { LocationService } from '../../location/location.service';
import { AuthService } from '../auth.service';
import { IAccount } from '../account.model';

declare var WeixinJSBridge;

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit, OnDestroy {
  account: IAccount;
  onDestroy$ = new Subject();
  contact: IContact;
  phoneVerified: string;
  form;
  balance: number;

  constructor(
    private accountSvc: AccountService,
    private authSvc: AuthService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private locationSvc: LocationService,
    private contactSvc: ContactService
  ) {
    const self = this;

    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: {name: 'account-setting'} });

    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      const accountId = account._id;

      self.account = account;
      self.contactSvc.find({ accountId: accountId }).pipe(takeUntil(this.onDestroy$)).subscribe((r: IContact[]) => {
        if (r && r.length > 0) {
          const contact = new Contact(r[0]);
          if (contact.location) {
            contact.address = this.locationSvc.getAddrString(contact.location);
          }
          self.contact = contact;
          self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: contact });
          Cookies.set('duocun-old-phone', contact.phone);
          Cookies.set('duocun-old-location', contact.location);
        } else {
          self.contact = { phone: '', address: '' };
          self.rx.dispatch<IContactAction>({ type: ContactActions.CLEAR, payload: null });
        }
      });

      self.balance = account.balance;
    });
  }


  ngOnInit() {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  changePhoneNumber() {
    this.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'account-setting' } });
  }

  changeAddress() {
    this.router.navigate(['contact/address-form'], { queryParams: { fromPage: 'account-setting' } });
  }

  logout() {
    this.authSvc.removeCookies();
    if (WeixinJSBridge) {
      WeixinJSBridge.call('closeWindow');
    }
    // this.rx.dispatch({ type: AccountActions.LOGOUT, payload: null });
  }

  toBalancePage() {
    this.router.navigate(['account/balance']);
  }

  toAddCreditPage() {
    this.router.navigate(['account/add-credit']);
  }
}
