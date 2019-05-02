import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { MatDialog } from '@angular/material';

import { IAppState } from '../../store';
import { SharedService } from '../../shared/shared.service';
import { Product, IProduct } from '../../product/product.model';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { ICart, ICartItem } from '../../cart/cart.model';
import { CartActions } from '../../cart/cart.actions';
import { WarningDialogComponent } from '../../shared/warning-dialog/warning-dialog.component';
import { IRestaurant, Restaurant } from '../../restaurant/restaurant.model';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { IDeliveryTime } from '../../delivery/delivery.model';

const ADD_IMAGE = 'add_photo.png';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent implements OnInit, OnChanges, OnDestroy {

  MEDIA_URL: string = environment.MEDIA_URL;
  defaultProductPicture = window.location.protocol + '//placehold.it/400x300';
  subscription: any;
  cart: any;
  categoryIds;
  groupedOrders: any = {};
  deliveryTime: IDeliveryTime;
  private onDestroy$ = new Subject<void>();

  @Input() restaurant: IRestaurant;
  @Input() categories;
  @Input() groupedProducts: Product[][];
  @Input() mode: string;

  constructor(
    private rx: NgRedux<IAppState>,
    private sharedSvc: SharedService,
    private restaurantSvc: RestaurantService,
    public dialog: MatDialog
  ) {
    rx.select<ICart>('cart').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((cart: ICart) => {
      this.cart = cart;
      if (this.groupedProducts) {
        const categoryIds = Object.keys(this.groupedProducts);
        categoryIds.map(categoryId => {
          this.groupedOrders[categoryId].map(order => {
            const cartItem: ICartItem = cart.items.find(item => item.productId === order.productId);
            order.quantity = cartItem ? cartItem.quantity : 0;
          });
        });
      }
    });
  }

  ngOnInit() {
    this.rx.select('deliveryTime').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x: IDeliveryTime) => {
      this.deliveryTime = x;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnChanges(v) {
    const cats = v.categories ? v.categories.currentValue : null;
    const gps = v.groupedProducts ? v.groupedProducts.currentValue : null;
    if (cats) {
      this.categories = cats;
    }
    if (gps) {
      this.groupedProducts = gps;
      const categoryIds = Object.keys(this.groupedProducts);

      categoryIds.map(categoryId => {
        const products = this.groupedProducts[categoryId];
        const orders = [];
        products.map(product => {
          const cartItem: ICartItem = this.cart.items.find(item => item.productId === product.id);
          if (cartItem) {
            orders.push({ productId: product.id, quantity: cartItem.quantity });
          } else {
            orders.push({ productId: product.id, quantity: 0 });
          }
        });

        this.groupedOrders[categoryId] = orders; // product array categoryId;
      });

      if (gps.length > 0) {
        this.categoryIds = Object.keys(this.groupedProducts);
      }
    }
  }

  addToCart(p: IProduct) {
    if (this.restaurantSvc.isClosed(this.restaurant, this.deliveryTime)) {
      alert('该商家休息，暂时无法配送');
      return;
    }
    // if (this.cart.items && this.cart.items.length > 0) {
    this.rx.dispatch({
      type: CartActions.ADD_TO_CART, payload:
        [{ productId: p.id, productName: p.name, price: p.price, quantity: 1, pictures: p.pictures,
          cost: p.cost,
          merchantId: p.merchantId, merchantName: this.restaurant.name }]
    });

    // } else {
    //   this.rx.dispatch({
    //     type: CartActions.ADD_TO_CART, payload:
    //       [{ productId: p.id, productName: p.name, price: p.price, quantity: 1, pictures: p.pictures,
    //         cost: p.cost,
    //         merchantId: p.merchantId, merchantName: this.restaurant.name }]
    //   });
    // }
  }

  removeFromCart(p: IProduct) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: [{ productId: p.id, productName: p.name, price: p.price, quantity: 1, pictures: p.pictures,
         merchantId: p.merchantId, merchantName: this.restaurant.name }]
    });
  }

  getProductImage(p: Product) {
    if (p.pictures && p.pictures[0] && p.pictures[0].url) {
      return this.sharedSvc.getMediaUrl() + p.pictures[0].url;
    } else {
      return this.defaultProductPicture;
    }
  }
}
