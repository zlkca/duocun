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
import { IMerchant } from '../../merchant/merchant.model';
import { ProductService } from '../../product/product.service';
import { IDelivery } from '../../delivery/delivery.model';
import { ICommand } from '../../shared/command.reducers';
import { CommandActions } from '../../shared/command.actions';
import { environment } from '../../../environments/environment';

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

  @ViewChild('orderDetailModal', { static: true }) orderDetailModal;

  constructor(
    private rx: NgRedux<IAppState>,
    private accountSvc: AccountService,
    private productSvc: ProductService,
    private sharedSvc: SharedService,
    private router: Router
  ) {
    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: { name: 'cart-page' }});
  }

  ngOnInit() {
    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((acc: Account) => {
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

    this.rx.select('restaurant').pipe(takeUntil(this.onDestroy$)).subscribe((r: IMerchant) => {
      this.restaurant = r;
      this.productSvc.find({ merchantId: r._id }).pipe(takeUntil(this.onDestroy$)).subscribe((ps: IProduct[]) => {
        if (environment.language === 'en') {
          ps.map(p => {
            p.name = p.nameEN;
          });
        }
        this.products = ps;
      });
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
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: 1,
          cost: product ? product.cost : 0,
          merchantId: item.merchantId,
          merchantName: item.merchantName
        }],
        merchantId: item.merchantId
      }
    });
  }

  removeFromCart(item: ICartItem) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: {
        items: [{
          productId: item.productId,
          productName: item.productName, price: item.price, quantity: 1,
          merchantId: item.merchantId,
          merchantName: item.merchantName
        }],
        merchantId: item.merchantId
      }
    });
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

  checkout() {
    this.router.navigate(['order/form'], { queryParams: { fromPage: 'restaurant-detail' } });
  }

  back() {
    const onSchedule = true;
    const merchantId = this.restaurant._id;
    if (this.restaurant) {
      this.router.navigate(['merchant/list/' + merchantId + '/' + onSchedule]);
    }
  }
}

