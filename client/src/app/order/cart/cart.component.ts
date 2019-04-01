import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { ICart, CartActions, ICartItem } from '../order.actions';
import { OrderService } from '../order.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from '../../account/account.service';
import { Account } from '../../account/account.model';
import { Order } from '../order.model';
import { Router } from '@angular/router';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  total = 0;
  quantity = 0;
  subscription;
  subscriptionAccount;
  cart: ICart;
  user: Account;
  private onDestroy$ = new Subject<void>();

  @ViewChild('orderDetailModal') orderDetailModal;

  constructor(
    private rx: NgRedux<IAppState>,
    private OrderServ: OrderService,
    private accountServ: AccountService,
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
  }

  addToCart(item: ICartItem) {
    this.rx.dispatch({
      type: CartActions.ADD_TO_CART,
      payload: { productId: item.productId, name: item.name, price: item.price, restaurantId: item.restaurantId }
    });
  }

  removeFromCart(item: ICartItem) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: { productId: item.productId, name: item.name, price: item.price, restaurantId: item.restaurantId }
    });
  }

  updateQuantity(item: ICartItem) {
    this.rx.dispatch({
      type: CartActions.UPDATE_QUANTITY,
      payload: { productId: item.productId, name: item.name, price: item.price,
        restaurantId: item.restaurantId, quantity: item.quantity }
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
            name: item.name,
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
}
