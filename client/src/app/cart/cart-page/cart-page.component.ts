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
import { ContactService } from '../../contact/contact.service';
import { LocationService } from '../../location/location.service';
import { Router, ActivatedRoute } from '../../../../node_modules/@angular/router';
import { ContactActions } from '../../contact/contact.actions';
import { Contact, IContact } from '../../contact/contact.model';
import { ILocation } from '../../location/location.model';
import { RestaurantActions } from '../../restaurant/restaurant.actions';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { ProductService } from '../../product/product.service';

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
  products: IProduct[];

  @ViewChild('orderDetailModal') orderDetailModal;

  constructor(
    private rx: NgRedux<IAppState>,
    private accountSvc: AccountService,
    private contactSvc: ContactService,
    private locationSvc: LocationService,
    private restaurantSvc: RestaurantService,
    private productSvc: ProductService,
    private sharedSvc: SharedService,
    private router: Router
  ) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'cart'
    });
  }

  ngOnInit() {
    this.rx.select<ICart>('cart').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((cart: ICart) => {
      this.total = 0;
      this.quantity = 0;
      cart.items.map(x => {
        this.total += x.price * x.quantity;
        this.quantity += x.quantity;
      });
      this.carts = this.groupItemsByRestaurant(cart.items);
    });

    this.accountSvc.getCurrent().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((acc: Account) => {
      this.account = acc;
    });

    this.rx.select('location').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((loc: ILocation) => {
      this.location = loc;
    });

    this.rx.select('restaurant').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((r: IRestaurant) => {
      this.restaurant = r;

      this.productSvc.find({merchantId: r.id}).pipe(
        takeUntil(this.onDestroy$)
      ).subscribe((ps: IProduct[]) => {
        this.products = ps;
      });
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
    const product = this.products.find(x => x.id === item.productId);
    this.rx.dispatch({
      type: CartActions.ADD_TO_CART,
      payload: [{
        productId: item.productId, productName: item.productName, price: item.price, quantity: 1,
        cost: product ? product.cost : 0,
        merchantId: item.merchantId, merchantName: item.merchantName
      }]
    });
  }

  removeFromCart(item: ICartItem) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: [{
        productId: item.productId, productName: item.productName, price: item.price, quantity: 1,
        merchantId: item.merchantId, merchantName: item.merchantName
      }]
    });
  }

  // cart --- grouped cart
  checkout(cart: any) {
    const self = this;
    const account = this.account;

    if (this.quantity > 0) {
      this.restaurantSvc.findById(cart.merchantId).subscribe(r => {
        this.rx.dispatch({
          type: RestaurantActions.UPDATE,
          payload: r
        });
      });

      self.contactSvc.find({ where: { accountId: account.id } }).subscribe((r: IContact[]) => {
        if (r && r.length > 0) {

          r[0].placeId = self.location.placeId;
          r[0].location = self.location;
          r[0].address = self.locationSvc.getAddrString(self.location);
          r[0].modified = new Date();
          this.rx.dispatch({ type: ContactActions.UPDATE, payload: r[0] });

          if (r[0].phone) {
            self.router.navigate(['order/form']);
          } else {
            self.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
          }
        } else {
          const contact = new Contact({
            accountId: account.id,
            username: account.username,
            phone: '', // account.phone,
            placeId: self.location.placeId,
            location: self.location,
            unit: '',
            buzzCode: '',
            address: self.locationSvc.getAddrString(self.location),
            created: new Date(),
            modified: new Date()
          });

          self.rx.dispatch({ type: ContactActions.UPDATE, payload: contact });
          self.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
        }
      });
    }
  }

  clearCart() {
    this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: [] });
  }

  createOrders(cart: ICart) {
    const ids = cart.items.map(x => x.merchantId);
    const merchantIds = ids.filter((val, i, a) => a.indexOf(val) === i);
    const orders = [];

    for (const id of merchantIds) {
      orders.push({ merchantId: id, items: [], accountId: this.account.id, clientName: this.account.username });
    }

    for (const item of cart.items) {
      for (const order of orders) {
        if (item.merchantId === order.merchantId) {
          const product = this.products.find(x => x.id === item.productId);
          order.items.push({
            productName: item.productName,
            price: item.price,
            cost: product ? product.cost : 0,
            quantity: item.quantity,
            productId: item.productId,
            merchantId: item.merchantId
          });
        }
      }
    }
    return orders;
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
      this.router.navigate(['restaurant/list/' +  this.restaurant.id]);
    }
  }
}

