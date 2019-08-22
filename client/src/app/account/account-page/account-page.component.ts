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
import { IOrder } from '../../order/order.model';
import { OrderService } from '../../order/order.service';
import { TransactionService } from '../../transaction/transaction.service';
import { ITransaction } from '../../transaction/transaction.model';
import * as moment from 'moment';

declare var WeixinJSBridge;

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit, OnDestroy {
  account: Account;
  phone;
  address;
  onDestroy$ = new Subject();
  contact;
  phoneVerified;
  form;
  balance;

  constructor(
    private accountSvc: AccountService,
    private authSvc: AuthService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private locationSvc: LocationService,
    private contactSvc: ContactService,
    private transactionSvc: TransactionService,
    private orderSvc: OrderService
  ) {
    const self = this;
    this.rx.dispatch({type: PageActions.UPDATE_URL, payload: 'account-setting'});

    self.accountSvc.getCurrentUser().pipe(takeUntil(this.onDestroy$)).subscribe((account: Account) => {
      self.account = account;
      self.contactSvc.find({ accountId: account.id }).pipe(takeUntil(this.onDestroy$)).subscribe((r: IContact[]) => {
        if (r && r.length > 0) {
          self.contact = new Contact(r[0]);
          self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: self.contact });

          Cookies.set('duocun-old-phone', self.contact.phone);
          Cookies.set('duocun-old-location', self.contact.location);
        } else {
          self.rx.dispatch<IContactAction>({ type: ContactActions.CLEAR, payload: null });
        }
      });

      self.reload(account);
    });
  }

  reload(account) {
    const self = this;
    let balance = 0;
    let list = [];
    const query = { clientId: account.id, status: { $nin: ['del', 'bad'] } };
    this.orderSvc.find(query).pipe(takeUntil(this.onDestroy$)).subscribe((os: IOrder[]) => {
      os.map(order => {
        list.push({ date: order.delivered, type: 'debit', amount: order.total });
      });
      const q = { type: 'credit', fromId: account.id };
      self.transactionSvc.find(q).pipe(takeUntil(this.onDestroy$)).subscribe((ts: ITransaction[]) => {
        ts.map(t => {
          list.push({ date: t.created, type: 'credit', amount: t.amount });
        });

        list = list.sort((a, b) => {
          const aMoment = moment(a.date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          const bMoment = moment(b.date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          if (aMoment.isAfter(bMoment)) {
            return 1; // b at top
          } else {
            return -1;
          }
        });

        list.map(t => {
          if (t.type === 'debit') {
            balance -= t.amount;
          } else if (t.type === 'credit') {
            balance += t.amount;
          }
        });

        self.balance = balance;
      });
    });
  }

  ngOnInit() {
    this.rx.select('contact').pipe(takeUntil(this.onDestroy$)).subscribe((contact: IContact) => {
      if (contact) {
        this.contact = contact;
        this.phone = contact.phone; // render
        if (contact.location) {
          this.address = this.locationSvc.getAddrString(contact.location);
        }
      } else {
        this.contact = { phone: '', address: '' };
        this.phone = '';
        this.address = '';
      }
    });
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
}
