import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Account } from '../account/account.model';
import { ICart, ICartItem } from '../order/order.actions';
import { IAppState } from '../store';
import { CommandActions } from '../shared/command.actions';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  year = 2018;
  account: Account;
  bCart = false;
  bCheckout = false;
  total;
  quantity;
  cart;

  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>
  ) {
    const self = this;
    this.rx.select('account').subscribe((account: Account) => {
      self.account = account;
    });
    this.rx.select<string>('page').subscribe(x => {
      if (x === 'restaurants') {
        self.bCart = true;
        self.bCheckout = false;
      } else if (x === 'orders') {
        self.bCart = false;
        self.bCheckout = true;
      } else {
        self.bCart = false;
        self.bCheckout = false;
      }
    });
    this.rx.select<ICart>('cart').subscribe(
      cart => {
        this.total = 0;
        this.quantity = 0;
        this.cart = cart;
        this.cart.items.map((x: ICartItem) => {
          this.total += x.price * x.quantity;
          this.quantity += x.quantity;
        });
      });
  }

  ngOnInit() {
  }

  toHome() {
    this.router.navigate(['main/home']);
  }

  toOrder() {
    if (this.account.type === 'user' || this.account.type === 'super') {
      this.router.navigate(['order/history']);
    } else if (this.account.type === 'worker') {
      this.router.navigate(['order/list-worker']);
    } else if (this.account.type === 'restaurant') {
      this.router.navigate(['order/list-restaurant']);
    }
  }

  toCart() {
    if (this.account.type === 'user' || this.account.type === 'super') {
      this.router.navigate(['order/cart']);
    } else if (this.account.type === 'worker') {
      this.router.navigate(['order/list-worker']);
    } else if (this.account.type === 'restaurant') {
      this.router.navigate(['order/list-restaurant']);
    }
  }

  toAccount() {
    this.router.navigate(['account/login']);
  }

  toAdmin() {
    this.router.navigate(['admin']);
  }

  checkout() {
    if (this.account.type === 'user' || this.account.type === 'super') {
      this.router.navigate(['order/list-client']);
    }
  }

  pay() {
    if (this.account.type === 'user' || this.account.type === 'super') {
      this.rx.dispatch({
        type: CommandActions.SEND,
        payload: 'pay'
      });
    }
    this.bCart = false;
    this.bCheckout = false;
  }
}
