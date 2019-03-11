import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { AccountService } from '../../account/account.service';
import { Account } from '../../lb-sdk';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  year = 2018;
  account: Account;

  constructor(
    private router: Router,
    private ngRedux: NgRedux<Account>
  ) {
    const self = this;
    this.ngRedux.select('account').subscribe((account: Account) => {
      self.account = account;
    });
  }

  ngOnInit() {
  }

  toHome() {
    this.router.navigate(['home']);
  }

  toOrder() {
    this.router.navigate(['orders']);
  }

  toCart() {
    this.router.navigate(['orders']);
  }

  toAccount() {
    this.router.navigate(['login']);
  }

  toAdmin() {
    this.router.navigate(['admin']);
  }
}
