import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICart, ICartItem } from '../cart.model';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { IContact, Contact } from '../../contact/contact.model';
import { ContactService } from '../../contact/contact.service';
import { Router } from '../../../../node_modules/@angular/router';
import { LocationService } from '../../location/location.service';
import { ContactActions } from '../../contact/contact.actions';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { RestaurantService } from '../../restaurant/restaurant.service';
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
  deliveryTime;

  @Input() restaurant: IRestaurant;
  @Output() afterCheckout = new EventEmitter();

  constructor(
    private rx: NgRedux<IAppState>,
    private contactSvc: ContactService,
    private locationSvc: LocationService,
    private restaurantSvc: RestaurantService,
    private router: Router,
  ) {
    // why not load from database
    this.rx.select('account').pipe(takeUntil(this.onDestroy$)).subscribe((account: Account) => {
      this.account = account;
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      this.deliveryTime = { from: x.fromTime, to: x.toTime };
      this.location = x.origin;
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
    const restaurant: IRestaurant = this.restaurant;

    if (this.restaurantSvc.isClosed(restaurant, this.deliveryTime)) {
      alert('该商家休息，暂时无法配送');
      return;
    }

    if (!this.restaurant.inRange) {
      alert('该商家不在配送范围内，暂时无法配送');
      return;
    }

    if (this.quantity > 0) {
      this.afterCheckout.emit({ productTotal: this.productTotal, quantity: this.quantity });
      const account = this.account;
      if (account && account.id) {
        // self.router.navigate(['order/form']);
        self.contactSvc.find({ accountId: account.id}).pipe(takeUntil(this.onDestroy$)).subscribe((r: IContact[]) => {
          if (r && r.length > 0) {
            this.rx.dispatch({
              type: CartActions.UPDATE_DELIVERY, payload: {
                merchantId: restaurant.id,
                merchantName: restaurant.name,
                deliveryCost: restaurant.fullDeliveryFee,
                deliveryFee: restaurant.deliveryFee,
                deliveryDiscount: restaurant.fullDeliveryFee - restaurant.deliveryFee
              }
            });

            // load contact from database
            self.rx.dispatch({
              type: ContactActions.UPDATE_WITHOUT_LOCATION,
              payload: r
            });
          } else {
            // const contact = new Contact({
            //   accountId: account.id,
            //   username: account.username,
            //   phone: '', // account.phone,
            //   placeId: self.location.placeId,
            //   location: self.location,
            //   unit: '',
            //   buzzCode: '',
            //   address: self.locationSvc.getAddrString(self.location),
            //   created: new Date(),
            //   modified: new Date()
            // });

            self.rx.dispatch({
              type: ContactActions.UPDATE_ACCOUNT,
              payload: {accountId: account.id, username: account.username}
            });

            self.rx.dispatch({
              type: CartActions.UPDATE_DELIVERY, payload: {
                merchantId: restaurant.id,
                merchantName: restaurant.name,
                deliveryCost: restaurant.fullDeliveryFee,
                deliveryFee: restaurant.deliveryFee,
                deliveryDiscount: restaurant.fullDeliveryFee - restaurant.deliveryFee
              }
            });
          }
          self.router.navigate(['order/form']);
        });
      }
    }
  }

}
