import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Account, IAccount } from '../account/account.model';
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
  account: IAccount;
  bHideNavMenu = false;
  page;
  selected = 'home';
  deliveryAddress;
  inRange;
  cart;
  quantity;
  productTotal;
  fromPage;
  private onDestroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>,
    private contactSvc: ContactService,
  ) {
    const self = this;
    this.rx.select('account').pipe(takeUntil(this.onDestroy$)).subscribe((account: Account) => { // must be redux
      self.account = account;
    });

    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      self.cart = cart;
      if (self.page === 'cart-page') {
        self.bHideNavMenu = cart.items.length !== 0;
      }
      self.quantity = cart.quantity;
      self.productTotal = cart.productTotal;
    });

    this.rx.select<string>('page').pipe(takeUntil(this.onDestroy$)).subscribe((x: any) => {
      self.page = x.name;
      self.selected = x.name;
      if (x.name === 'contact-form' || x.name === 'phone-form' || x.name === 'address-form' || x.name === 'restaurant-detail' ||
        x.name === 'cart-page' || x.name === 'order-form') {
        self.bHideNavMenu = true;
        if (x.name === 'address-form') {
          self.fromPage = x.fromPage;
        }
      } else {
        self.bHideNavMenu = false;
      }
    });

    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'loggedIn') {
        self.bHideNavMenu = false;
      } else if (x.name === 'address-change') {
        self.deliveryAddress = x.args.address;
        self.inRange = x.args.inRange;
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
    const accountId = this.account._id;
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'clear-location-list', args: null }
    });

    this.contactSvc.find({ accountId: accountId }).subscribe((r: IContact[]) => {
      // if (r && r.length > 0 && r[0].location) {
      //   this.router.navigate(['main/filter']);
      // } else {
      this.selected = 'home';
      this.router.navigate(['main/home']);
      // }
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

  // toCart() {
  //   this.router.navigate(['cart']);
  // }

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

  cancelAddress() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'cancel-address', args: null }
    });
  }

  saveAddress() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'save-address', args: null }
    });
  }

  pay() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'pay', args: null }
    });
  }

  checkout() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'checkout', args: null }
    });
  }

  cartBack() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'cart-back', args: null }
    });
  }

  onAfterCheckout($event) {
    // this.rx.dispatch({
    //   type: CommandActions.SEND,
    //   payload: { name: 'after-checkout', args: $event }
    // });
  }

  toCart() {
    if (this.quantity > 0) { // prevent missing bottom menus
      this.router.navigate(['cart']);
    }
  }

  checkoutFromRestaurant() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'checkout-from-restaurant', args: null }
    });
  }
}
