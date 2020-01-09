import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../product.service';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { Product, IProduct } from '../../product/product.model';

import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { ICart } from '../../cart/cart.model';
import { CartActions } from '../../cart/cart.actions';
import { Subject } from '../../../../node_modules/rxjs';
import * as moment from 'moment';
import { IDelivery } from '../../delivery/delivery.model';
import { RangeService } from '../../range/range.service';
// import { MallService } from '../../mall/mall.service';
import { IMerchant } from '../../merchant/merchant.model';
import { IRange } from '../../range/range.model';
// import { IMall } from '../../mall/mall.model';

const ADD_IMAGE = 'add_photo.png';

@Component({
  providers: [ProductService],
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy, OnChanges {
  MEDIA_URL: string = environment.MEDIA_URL;

  @Input() restaurant: IMerchant;
  @Input() items: any[]; // {product:x, quantity: y}
  @Input() mode: string;
  @Input() hasAddress: boolean;
  @Output() select = new EventEmitter();
  @Output() afterDelete = new EventEmitter();

  selected = null;
  onDestroy$ = new Subject();
  cart;
  delivery: IDelivery;
  ranges: IRange[];

  ngOnInit() {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnChanges(d) { // this is run before ngOnInit

  }

  constructor(
    private rangeSvc: RangeService,
    private router: Router,
    private rx: NgRedux<IAppState>
  ) {
    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      this.delivery = x;
    });
  }

  addToCart(p: IProduct) {
    const merchant = this.restaurant;

    if (!this.hasAddress) {
      alert('请先输入送餐地址');
      this.router.navigate(['main/home']);
      return;
    }

    if (merchant.isClosed || (this.hasAddress && !merchant.onSchedule)) {
      alert('该商家休息，暂时无法配送');
      return;
    }

    if (merchant.orderEnded) {
      alert('已过下单时间，该商家下单截止到' + this.restaurant.orderEndTime + 'am');
      return;
    }

    const origin = this.delivery.origin;
    if (origin) {
      this.rangeSvc.inDeliveryRange(origin).pipe(takeUntil(this.onDestroy$)).subscribe((inRange: boolean) => {
        if (!inRange) {
          alert('该商家不在配送范围内，暂时无法配送'); // should never go here!
          return;
        } else {
          this.rx.dispatch({
            type: CartActions.ADD_TO_CART,
            payload: {
              items: [{
                productId: p._id,
                productName: p.name,
                price: p.price,
                cost: p.cost,
                quantity: 1,
                pictures: p.pictures,
                merchantId: p.merchantId, // merchant account id
                merchantName: p.merchant.name
              }],
              merchantId: p.merchantId // merchant account id
            }
          });
        }
      });

    }
  }

  removeFromCart(p: IProduct) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: {
        items: [{
          productId: p._id,
          productName: p.name,
          price: p.price,
          cost: p ? p.cost : 0,
          quantity: 1,
          pictures: p.pictures,
          merchantId: p.merchantId,
          merchantName: p.merchant.name
        }],
        merchantId: p.merchantId
      }
    });
  }

  getProductImage(p: Product) {
    if (p.pictures && p.pictures[0] && p.pictures[0].url) {
      return environment.MEDIA_URL + p.pictures[0].url;
    } else {
      return null;
    }
  }

  onQuantityChanged(v, item) {
    const p = item.product;
    const quantity = v ? v : 0;
    this.rx.dispatch({
      type: CartActions.UPDATE_QUANTITY,
      payload: {
        items: [{
          productId: p._id,
          productName: p.name,
          price: p.price,
          quantity: quantity,
          pictures: p.pictures,
          cost: p ? p.cost : 0,
          merchantId: p.merchantId,
          merchantName: p.merchant.name
        }]
      }
    });
  }

  getImageSrc(p) {
    if (p.fpath) {
      return this.MEDIA_URL + p.fpath;
    } else {
      return this.MEDIA_URL + ADD_IMAGE;
    }
  }

  onSelect(p) {
    this.selected = p;
    this.select.emit({ 'product': p });
  }

}

