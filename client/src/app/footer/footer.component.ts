import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Account } from '../account/account.model';
import { IAppState } from '../store';
import { CommandActions } from '../shared/command.actions';
import { takeUntil } from '../../../node_modules/rxjs/operators';
import { Subject } from '../../../node_modules/rxjs';
import { ICart, ICartItem } from '../cart/cart.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  year = 2018;
  account: Account;
  bCart = false;
  bPay = false;
  total;
  quantity;
  cart;
  private onDestroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>
  ) {
    const self = this;
    this.rx.select('account').subscribe((account: Account) => {
      self.account = account;
    });

    this.rx.select<string>('page').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(x => {
      if (x === 'restaurant-detail' || x === 'cart') {
        self.bCart = true;
        self.bPay = false;
      } else if (x === 'order-confirm') {
        self.bCart = false;
        self.bPay = true;
      } else {
        self.bCart = false;
        self.bPay = false;
      }
    });

    this.rx.select<ICart>('cart').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(
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

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
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
      this.router.navigate(['cart']);
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
      if (this.quantity > 0) {
        this.router.navigate(['contact/list']);
      }
    } else {
      this.router.navigate(['acccount/login']);
    }
  }

  pay() {
    if (this.account.type === 'user' || this.account.type === 'super') {
      if (this.quantity > 0) {
        this.rx.dispatch({
          type: CommandActions.SEND,
          payload: 'pay'
        });
      }
      this.bCart = false;
      this.bPay = false;
    } else {
      // pass
    }
  }
}
