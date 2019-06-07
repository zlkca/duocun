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
// import { BalanceService } from '../../payment/balance.service';
// import { IBalance } from '../../payment/payment.model';
// import * as moment from 'moment';
import { PaymentService } from '../../payment/payment.service';
import { IClientPayment } from '../../payment/payment.model';
import { IOrder } from '../../order/order.model';
import { OrderService } from '../../order/order.service';
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
  onDestroy$ = new Subject<any>();
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
    // private balanceSvc: BalanceService,
    private paymentSvc: PaymentService,
    private orderSvc: OrderService
  ) {
    const self = this;
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'account-setting'
    });

    self.accountSvc.getCurrentUser().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: Account) => {
      self.account = account;

      self.contactSvc.find({ where: { accountId: account.id } }).pipe(
        takeUntil(this.onDestroy$)
      ).subscribe((r: IContact[]) => {
        if (r && r.length > 0) {
          self.contact = new Contact(r[0]);
          self.rx.dispatch<IContactAction>({ type: ContactActions.LOAD_FROM_DB, payload: self.contact });

          Cookies.set('duocun-old-phone', self.contact.phone);
          Cookies.set('duocun-old-location', self.contact.location);
        } else {
          self.rx.dispatch<IContactAction>({ type: ContactActions.CLEAR, payload: null });
        }
      });

      // self.balanceSvc.find({ where: { accountId: account.id } }).pipe(
      //   takeUntil(this.onDestroy$)
      // ).subscribe((bs: IBalance[]) => {
      //   if (bs && bs.length > 0) {
      //     const balances = bs.sort((a: IBalance, b: IBalance) => {
      //       if (moment(a.created).isAfter(b.created)) {
      //         return -1;
      //       } else {
      //         return 1;
      //       }
      //     });
      //     this.balance = balances[0];
      //   }
      // });


      self.balance = 0;

      self.orderSvc.find({ where: { clientId: account.id } }).pipe(takeUntil(this.onDestroy$)).subscribe((os: IOrder[]) => {
        os.map(order => {
          if (order.status !== 'bad') {
            self.balance -= order.total;
          }
        });

        self.paymentSvc.find({
          where: { clientId: account.id }
        }).pipe(takeUntil(this.onDestroy$)).subscribe((ps: IClientPayment[]) => {
          ps.map(p => {
            if (p.type === 'credit' && p.amount > 0) {
              self.balance += p.amount;
            }
          });
        });
      });
    });
  }

  ngOnInit() {
    this.rx.select('contact').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((contact: IContact) => {
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
