import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICart, ICartItem } from '../cart.model';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { IContact, Contact } from '../../contact/contact.model';
import { Router } from '../../../../node_modules/@angular/router';
import { ContactActions } from '../../contact/contact.actions';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { IDelivery } from '../../delivery/delivery.model';
import { CartActions } from '../cart.actions';

@Component({
  selector: 'app-cart-navbar',
  templateUrl: './cart-navbar.component.html',
  styleUrls: ['./cart-navbar.component.scss']
})
export class CartNavbarComponent implements OnInit {
  onDestroy$ = new Subject<any>();
  quantity;
  productTotal;
  location;
  account;
  contact;

  @Input() restaurant: IRestaurant;
  @Output() afterCheckout = new EventEmitter();

  constructor(
    private rx: NgRedux<IAppState>,
    private router: Router,
  ) {
    // why not load from database
    this.rx.select('account').pipe(takeUntil(this.onDestroy$)).subscribe((account: Account) => {
      this.account = account;
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      this.location = x.origin;
    });

    this.rx.select<IContact>('contact').pipe(takeUntil(this.onDestroy$)).subscribe((contact: IContact) => {
      this.contact = contact;
    });
  }

  ngOnInit() {
    const self = this;
    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      self.quantity = cart.quantity;
      self.productTotal = cart.productTotal;
    });
  }

  toCart() {
    if (this.quantity > 0) { // prevent missing bottom menus
      this.router.navigate(['cart']);
    }
  }

  checkout() {
    const self = this;
    // if it doesn't have default address
    if (this.location) {
      if (this.contact) {
        self.router.navigate(['order/form']);
      } else {
        this.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
      }
    } else {
      self.rx.dispatch({ type: ContactActions.UPDATE_LOCATION, payload: {location: null} });
      this.router.navigate(['contact/address-form'], { queryParams: { fromPage: 'restaurant-detail' } });
    }
  }

}
