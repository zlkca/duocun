import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { OrderService } from '../../order/order.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from '../../account/account.service';
import { Product } from '../../product/product.model';
import { Account } from '../../account/account.model';
import { Order } from '../order.model';

import { Router } from '@angular/router';
import { PageActions } from '../../main/main.actions';
import { SharedService } from '../../shared/shared.service';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { ICart, ICartItem } from '../../cart/cart.model';
import { CartActions } from '../../cart/cart.actions';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit, OnDestroy {
  total = 0;
  quantity = 0;
  subscriptionAccount;
  cart: ICart;
  user: Account;
  defaultProductPicture = window.location.protocol + '//placehold.it/400x300';
  private onDestroy$ = new Subject<void>();

  @ViewChild('orderDetailModal') orderDetailModal;

  constructor(
    private rx: NgRedux<IAppState>,
    private OrderServ: OrderService,
    private accountServ: AccountService,
    private sharedSvc: SharedService,
    private modalServ: NgbModal,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.rx.select<ICart>('cart').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(
      cart => {
        this.total = 0;
        this.quantity = 0;
        this.cart = cart;
        this.cart.items.map(x => {
          this.total += x.price * x.quantity;
          this.quantity += x.quantity;
        });
      });

    this.subscriptionAccount = this.accountServ.getCurrent()
      .subscribe((acc: Account) => {
        console.log(acc);
        this.user = acc;
      });

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'restaurants'
    });
  }

  addToCart(item: ICartItem) {
    this.rx.dispatch({
      type: CartActions.ADD_TO_CART,
      payload: { productId: item.productId, name: item.productName, price: item.price,
        restaurantId: item.restaurantId, restaurantName: item.restaurantName  }
    });
  }

  removeFromCart(item: ICartItem) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: { productId: item.productId, name: item.productName, price: item.price,
        restaurantId: item.restaurantId, restaurantName: item.restaurantName  }
    });
  }

  updateQuantity(item: ICartItem) {
    this.rx.dispatch({
      type: CartActions.UPDATE_QUANTITY,
      payload: { productId: item.productId, name: item.productName, price: item.price,
        restaurantId: item.restaurantId, restaurantName: item.restaurantName, quantity: item.quantity }
    });
  }

  checkout() {
    const orders = this.createOrders(this.cart);
    if (orders[0].accountId) {
      // this.modalServ.open(this.orderDetailModal);
      this.router.navigate(['order/list-client']);
    } else {
      this.router.navigate(['account/login']);
    }
  }

  clearCart() {
    this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: {} });
  }

  createOrders(cart: ICart) {
    const ids = cart.items.map(x => x.restaurantId);
    const restaurantIds = ids.filter((val, i, a) => a.indexOf(val) === i);
    const orders = [];

    for (const id of restaurantIds) {
      orders.push({ restaurantId: id, items: [], accountId: this.user.id });
    }

    for (const item of cart.items) {
      for (const order of orders) {
        if (item.restaurantId === order.restaurantId) {
          order.items.push({
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            productId: item.productId,
            restaurantId: item.restaurantId
          });
        }
      }
    }
    return orders;
  }

  confirmed() {
    const orders = this.createOrders(this.cart);
    this.OrderServ.save(orders[0]).subscribe((order: Order) => {
        this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: {} });
      });
    this.router.navigate(['restaurant/list']);
  }

  ngOnDestroy() {
    this.subscriptionAccount.unsubscribe();
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
}

