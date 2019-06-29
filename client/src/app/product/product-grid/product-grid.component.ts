import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { MatDialog } from '@angular/material';

import { IAppState } from '../../store';
import { SharedService } from '../../shared/shared.service';
import { Product, IProduct, ICategory } from '../../product/product.model';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { ICart, ICartItem } from '../../cart/cart.model';
import { CartActions } from '../../cart/cart.actions';
import { WarningDialogComponent } from '../../shared/warning-dialog/warning-dialog.component';
import { IRestaurant, Restaurant } from '../../restaurant/restaurant.model';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { IDeliveryTime, IDelivery } from '../../delivery/delivery.model';
import { CategoryService } from '../../category/category.service';

const ADD_IMAGE = 'add_photo.png';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent implements OnInit, OnDestroy {

  MEDIA_URL: string = environment.MEDIA_URL;
  defaultProductPicture = window.location.protocol + '//placehold.it/400x300';
  subscription: any;
  cart: any;
  categoryIds;
  groupedOrders: any = {};
  deliveryTime: IDeliveryTime;
  private onDestroy$ = new Subject<void>();
  groups;

  @Input() restaurant: IRestaurant;
  @Input() products: any[];
  @Input() mode: string;

  constructor(
    private rx: NgRedux<IAppState>,
    private sharedSvc: SharedService,
    private categorySvc: CategoryService,
    private restaurantSvc: RestaurantService,
    public dialog: MatDialog
  ) {
    const self = this;
    rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
      if (this.products) {
        self.categorySvc.find().pipe(takeUntil(self.onDestroy$)).subscribe(categories => {
          self.groups = self.groupByCategory(this.products, categories);
          self.groups.map(group => {
            group.items.map(groupItem => {
              const cartItem: ICartItem = cart.items.find(item => item.productId === groupItem.product.id);
              groupItem.quantity = cartItem ? cartItem.quantity : 0;
            });
          });
        });
      }
    });
  }

  ngOnInit() {
    const self = this;
    this.rx.select('delivery').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x: IDelivery) => {
      this.deliveryTime = { from: x.fromTime, to: x.toTime };
    });
    self.categorySvc.find().pipe(takeUntil(self.onDestroy$)).subscribe(categories => {
      self.groups = self.groupByCategory(this.products, categories);
      if (this.groups && this.groups.length > 0) {
        this.groups.map(group => {
          group.items.map(groupItem => {
            const cartItem: ICartItem = this.cart.items.find(item => item.productId === groupItem.product.id);
            groupItem.quantity = cartItem ? cartItem.quantity : 0;
          });
        });
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  groupByCategory(products: IProduct[], categories: ICategory[]) {
    const cats = [];

    products.map(p => {
      const cat = cats.find(c => c.categoryId === p.categoryId);
      const category = categories.find(c => c.id === p.categoryId);
      if (cat) {
        cat.items.push({ product: p, quanlity: 0 });
      } else {
        if (category) {
          cats.push({
            categoryId: p.categoryId, categoryName: p.category.name, order: category.order,
            items: [{ product: p, quanlity: 0 }]
          });
        } else {
          cats.push({
            categoryId: p.categoryId, categoryName: p.category.name, order: 0,
            items: [{ product: p, quanlity: 0 }]
          });
        }
      }
    });

    cats.map(c => {
      c.items.sort((a, b) => {
        if (a.product.order < b.product.order) {
          return -1;
        } else {
          return 1;
        }
      });
    });

    return cats.sort((a, b) => {
      if (a.order < b.order) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  addToCart(p: IProduct) {
    // fix me
    if (this.restaurantSvc.isClosed(this.restaurant, this.deliveryTime)) {
      alert('该商家休息，暂时无法配送');
      return;
    }
    if (!this.restaurant.inRange) {
      alert('该商家不在配送范围内，暂时无法配送');
      return;
    }
    if (this.restaurantSvc.isAfterOrderDeadline(this.restaurant)) {
      alert('已过下单时间，该商家下单截止到' + this.restaurant.orderDeadline + 'am' );
      return;
    }
    this.rx.dispatch({
      type: CartActions.ADD_TO_CART, payload:
      {
        items: [{
          productId: p.id, productName: p.name, price: p.price, quantity: 1, pictures: p.pictures,
          cost: p.cost,
          merchantId: p.merchantId, merchantName: this.restaurant.name
        }]
      }
    });
  }

  removeFromCart(p: IProduct) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: {
        items: [{
          productId: p.id, productName: p.name, price: p.price, quantity: 1, pictures: p.pictures,
          merchantId: p.merchantId, merchantName: this.restaurant.name
        }]
      }
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
