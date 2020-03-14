import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { IAccount } from '../account/account.model';
import { IAppState } from '../store';
import { CommandActions } from '../shared/command.actions';
import { takeUntil } from '../../../node_modules/rxjs/operators';
import { Subject } from '../../../node_modules/rxjs';
import { ICommand } from '../shared/command.reducers';
import {Cart, ICart} from '../cart/cart.model';
import { IDelivery } from '../delivery/delivery.model';
import { AccountService } from '../account/account.service';
import { IOrder } from '../order/order.model';
import { environment } from '../../environments/environment.prod';
import { IMerchant } from '../merchant/merchant.model';

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
  cart: Cart;
  quantity;
  productTotal;
  fromPage;
  delivery;
  order;
  merchant;
  lang = environment.language;

  private onDestroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>,
    private accountSvc: AccountService
  ) {
    const self = this;

    // listen account changes from UI
    this.rx.select<IAccount>('account').pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => { // must be redux
      if (!account) {
        this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account1: IAccount) => {
          self.account = account1;
        });
      } else {
        self.account = account;
      }
    });

    this.rx.select<Cart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: Cart) => {
      self.cart = cart;
      if (self.page === 'cart-page') {
        self.bHideNavMenu = cart.items.length !== 0;
      }
      self.quantity = cart.quantity;
      self.productTotal = cart.price;
    });

    this.rx.select('merchant').pipe(takeUntil(this.onDestroy$)).subscribe((x: IMerchant) => {
      self.merchant = x;
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      self.delivery = x;
    });

    // for update paymentMethod for order-form-page
    this.rx.select('order').pipe(takeUntil(this.onDestroy$)).subscribe((order: IOrder) => {
      this.order = order;
    });

    this.rx.select<string>('page').pipe(takeUntil(this.onDestroy$)).subscribe((x: any) => {
      self.page = x.name;
      self.selected = x.name;
      if (x.name === 'phone-form' || x.name === 'address-form' || x.name === 'restaurant-detail' ||
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
    if (this.account) {
      this.rx.dispatch({
        type: CommandActions.SEND,
        payload: { name: 'clear-location-list', args: null }
      });
      this.selected = 'home';
      this.router.navigate(['main/home']);
    } else {
      this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account1: IAccount) => {
        this.account = account1;
        this.rx.dispatch({
          type: CommandActions.SEND,
          payload: { name: 'clear-location-list', args: null }
        });
        this.selected = 'home';
        this.router.navigate(['main/home']);
      });
    }
  }

  toOrder() {
    if (this.account) {
      this.selected = 'order';
      this.router.navigate(['order/history']);
    } else {
      const hint = this.lang === 'en' ? 'Require login, please try place an order, we will bring you to signup process' :
      '登陆用户才能访问订单历史，请尝试重新进入并完成微信登陆';
      alert(hint);
      // this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account1: IAccount) => {
      //   this.account = account1;
      //   this.selected = 'order';
      //   this.router.navigate(['order/history']);
      // });
    }
  }

  // toCart() {
  //   this.router.navigate(['cart']);
  // }

  toAccount() {
    if (this.account) {
      this.selected = 'account';
      this.router.navigate(['account/settings']);
    } else {
      const hint = this.lang === 'en' ? 'Require login, please try place an order, we will bring you to signup process' :
      '登陆用户才能访问订单历史，请尝试重新进入并完成微信登陆';
      alert(hint);
      // this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account1: IAccount) => {
      //   this.account = account1;
      //   this.selected = 'account';
      //   this.router.navigate(['account/settings']);
      // });
    }
  }

  getColor(menu) {
    return (this.selected === menu) ? '#4285F4' : 'black';
    // .fill{
    //   color: '#F4B400'; // '#0F9D58' // green
    // }
  }

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
      payload: {
        name: 'pay',
        args: {
          merchant: this.merchant,
          cart: this.cart,
          delivery: this.delivery,
          paymentMethod: this.order.paymentMethod
        }
      }
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

  checkoutFromCartPage() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'checkout', args: null }
    });
  }

  checkoutFromRestaurant() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'checkout-from-restaurant', args: null }
    });
  }
}
