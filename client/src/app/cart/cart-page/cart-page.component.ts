import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { AccountService } from '../../account/account.service';
import { Product, IProduct } from '../../product/product.model';
import { Account } from '../../account/account.model';

import { PageActions } from '../../main/main.actions';
import { SharedService } from '../../shared/shared.service';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { ICart, ICartItem } from '../../cart/cart.model';
import { CartActions } from '../../cart/cart.actions';
import { Router, ActivatedRoute } from '../../../../node_modules/@angular/router';
import { ContactActions } from '../../contact/contact.actions';
import { Contact, IContact } from '../../contact/contact.model';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { ProductService } from '../../product/product.service';
import { IDelivery } from '../../delivery/delivery.model';
import { ICommand } from '../../shared/command.reducers';
import { CommandActions } from '../../shared/command.actions';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit, OnDestroy {
  total = 0;
  quantity = 0;
  cart: ICart;
  account: Account;
  defaultProductPicture = window.location.protocol + '//placehold.it/400x300';
  private onDestroy$ = new Subject<void>();
  carts;
  location;
  restaurant;
  contact;
  products: IProduct[];

  @ViewChild('orderDetailModal', { static: true }) orderDetailModal;

  constructor(
    private rx: NgRedux<IAppState>,
    private accountSvc: AccountService,
    private productSvc: ProductService,
    private sharedSvc: SharedService,
    private router: Router
  ) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: { name: 'cart-page' }
    });
  }

  ngOnInit() {
    this.accountSvc.getCurrent().pipe(takeUntil(this.onDestroy$)).subscribe((acc: Account) => {
      this.account = acc;
    });

    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.total = cart.total;
      this.quantity = cart.quantity;
      this.carts = this.groupItemsByRestaurant(cart.items);
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((d: IDelivery) => {
      this.location = d.origin;
    });

    this.rx.select('restaurant').pipe(takeUntil(this.onDestroy$)).subscribe((r: IRestaurant) => {
      this.restaurant = r;
      this.productSvc.find({ merchantId: r.id }).pipe(takeUntil(this.onDestroy$)).subscribe((ps: IProduct[]) => {
        this.products = ps;
      });
    });

    this.rx.select<IContact>('contact').pipe(takeUntil(this.onDestroy$)).subscribe((contact: IContact) => {
      this.contact = contact;
    });

    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'checkout') {
        this.rx.dispatch({ type: CommandActions.SEND, payload: {name: ''}});
        this.checkout();
      } else if (x.name === 'cart-back') {
        this.rx.dispatch({ type: CommandActions.SEND, payload: {name: ''}});
        this.back();
      }
    });
  }

  groupItemsByRestaurant(items: ICartItem[]) {
    const groupedCarts = [];
    items.map(item => {
      const cart = groupedCarts.find(group => group.merchantId === item.merchantId);
      if (cart) {
        cart.productTotal += item.price * item.quantity;
        cart.items.push(item);
      } else {
        groupedCarts.push({
          merchantId: item.merchantId,
          merchantName: item.merchantName,
          productTotal: item.price * item.quantity,
          items: [item]
        });
      }
    });
    return groupedCarts;
  }

  addToCart(item: ICartItem) {
    const product = this.products.find(x => x._id === item.productId);
    this.rx.dispatch({
      type: CartActions.ADD_TO_CART,
      payload: {
        items: [{
          productId: item.productId, productName: item.productName, price: item.price, quantity: 1,
          cost: product ? product.cost : 0,
          merchantId: item.merchantId, merchantName: item.merchantName
        }]
      }
    });
  }

  removeFromCart(item: ICartItem) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: {
        items: [{
          productId: item.productId, productName: item.productName, price: item.price, quantity: 1,
          merchantId: item.merchantId, merchantName: item.merchantName
        }]
      }
    });
  }

  // cart --- grouped cart
  checkout() {
    const self = this;

    // if it doesn't have default address
    if (this.location) {
      if (this.contact) {
        this.router.navigate(['order/form']);
      } else {
        this.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
      }
    } else {
      this.rx.dispatch({ type: ContactActions.UPDATE_LOCATION, payload: { location: null } });
      this.router.navigate(['contact/address-form'], { queryParams: { fromPage: 'restaurant-detail' } });
    }
  }


  clearCart() {
    this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: [] });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getProductImage(p: Product) {
    if (p.pictures && p.pictures[0] && p.pictures[0].url) {
      return this.sharedSvc.getMediaUrl() + p.pictures[0].url;
    } else {
      return this.defaultProductPicture;
    }
  }

  onAfterCheckout(e) {
    const self = this;
  }

  back() {
    if (this.restaurant) {
      this.router.navigate(['merchant/list/' + this.restaurant.id]);
    }
  }
}

