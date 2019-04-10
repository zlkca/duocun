import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { IAccount } from '../account.model';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit {
  account: Account;
  constructor(
    private accountSvc: AccountService,
    private rx: NgRedux<IAppState>
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
  }

}
