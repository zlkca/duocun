import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '../account.service';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { IAccount } from '../account.model';
import { Router } from '@angular/router';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { IContact, Contact } from '../../contact/contact.model';
import { Subject } from '../../../../node_modules/rxjs';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit, OnDestroy {
  account: Account;
  phone;
  onDestroy$ = new Subject<any>();
  contact;
  phoneVerified;
  form;

  constructor(
    private accountSvc: AccountService,
    private rx: NgRedux<IAppState>,
    private router: Router
  ) {
    const self = this;

    self.accountSvc.getCurrentUser().subscribe((account: Account) => {
      self.account = account;
      // if (account) {
      //   self.rx.dispatch({ type: AccountActions.UPDATE, payload: account });
      // }


    });
  }

  ngOnInit() {
    this.rx.select('contact').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((contact: IContact) => {
      if (contact) {
        this.contact = contact;
        this.phone = contact.phone; // render
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
}
