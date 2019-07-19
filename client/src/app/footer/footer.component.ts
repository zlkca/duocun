import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Account } from '../account/account.model';
import { IAppState } from '../store';
import { CommandActions } from '../shared/command.actions';
import { takeUntil } from '../../../node_modules/rxjs/operators';
import { Subject } from '../../../node_modules/rxjs';
import { ContactService } from '../contact/contact.service';
import { IContact } from '../contact/contact.model';
import { ICommand } from '../shared/command.reducers';
import { ICart } from '../cart/cart.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  year = 2019;
  account: Account;
  bHide = false;
  page;
  selected = 'home';
  private onDestroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>,
    private contactSvc: ContactService,
  ) {
    const self = this;
    this.rx.select('account').pipe(takeUntil(this.onDestroy$)).subscribe((account: Account) => {
      self.account = account;
    });

    this.rx.select('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      if (self.page === 'cart') {
        self.bHide = cart.items.length > 0;
      }
    });

    this.rx.select<string>('page').pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      self.page = x;
      if (x === 'contact-form' || x === 'phone-form' || x === 'address-form' || x === 'restaurant-detail' ||
        x === 'cart' || x === 'order-confirm' || x === 'home') {
        self.bHide = true;
      } else {
        self.bHide = false;
      }
    });

    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'loggedIn') {
        self.bHide = false;
      } else if (x.name === 'firstTimeUse') {
        self.bHide = x.args;
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  toHome() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'clear-location-list', args: null }
    });

    this.contactSvc.find({ accountId: this.account.id }).subscribe((r: IContact[]) => {
      if (r && r.length > 0 && r[0].location) {
        this.router.navigate(['main/filter']);
      } else {
        this.selected = 'home';
        this.router.navigate(['main/home']);
      }
    });
  }

  toOrder() {
    if (this.account) {
      this.selected = 'order';
      this.router.navigate(['order/history']);
    } else {
      this.router.navigate(['account/login']);
    }
  }

  toCart() {
    this.router.navigate(['cart']);
  }

  toAccount() {
    if (this.account) {
      this.selected = 'account';
      this.router.navigate(['account/setting']);
    } else {
      this.router.navigate(['account/login']);
    }
  }

  toAdmin() {
    if (this.account) {
      this.router.navigate(['admin']);
    } else {
      this.router.navigate(['account/login']);
    }
  }

  getColor(menu) {
    return (this.selected === menu) ? '#4285F4' : 'black';
    // .fill{
    //   color: '#F4B400'; // '#0F9D58' // green
    // }
  }

  // saveContact() {
  //   this.rx.dispatch({
  //     type: CommandActions.SEND,
  //     payload: {name: 'save-contact', args: null}
  //   });
  // }

  // cancelContact() {
  //   this.rx.dispatch({
  //     type: CommandActions.SEND,
  //     payload: {name: 'cancel-contact', args: null}
  //   });
  // }
}
