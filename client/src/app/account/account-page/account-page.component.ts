import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '../account.service';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { Router } from '@angular/router';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
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
  phoneVerified: string;
  form;
  balance: number;
  address: string;

  constructor(
    private accountSvc: AccountService,
    private authSvc: AuthService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private locationSvc: LocationService,
  ) {
    const self = this;

    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: { name: 'account-setting' } });

    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      self.account = account;
      self.balance = account ? account.balance : 0;

      if (account && account.location) {
        self.address = this.locationSvc.getAddrString(account.location);
        Cookies.set('duocun-old-location', account.location);
      } else {
        Cookies.set('duocun-old-location', '');
      }

      if (account && account.phone) {
        Cookies.set('duocun-old-phone', account.phone);
      } else {
        Cookies.set('duocun-old-phone', '');
      }
    });
  }


  ngOnInit() {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getDefaultAddress() {
    return this.account.location ? this.locationSvc.getAddrString(this.account.location) : '';
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
