import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../product.service';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { Product, IProduct, ProductStatus } from '../../product/product.model';

import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { IDelivery } from '../../delivery/delivery.model';
import { IMerchant } from '../../merchant/merchant.model';
import { IRange } from '../../range/range.model';
import {CartItem, ICart} from '../../cart/cart.model';
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
  @Output() add = new EventEmitter();
  @Output() remove = new EventEmitter();
  @Output() setquantity = new EventEmitter();
  selected = null;
  onDestroy$ = new Subject();
  delivery: IDelivery;
  ranges: IRange[];
  lang = environment.language;
  Status = ProductStatus;
  cart;
  ngOnInit() {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnChanges(d) { // this is run before ngOnInit

  }

  constructor(
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

  isValidProduct(p: IProduct) {
    const merchant = this.restaurant;
    const addressHint = this.lang === 'en' ? 'Please enter delivery address' : '请先输入送餐地址';
    const breakHint = this.lang === 'en' ? 'The merchant closed, can not deliver today' : '该商家休息，暂时无法配送';
    const overTimeHint = this.lang === 'en' ? 'The last order should before ' : '已过下单时间，该商家下单截止到';
    // const notInRangeHint = this.lang === 'en' ? 'The merchant is not in service range, can not deliver' : '该商家不在配送范围内，暂时无法配送';
    if (!this.hasAddress) {
      alert(addressHint);
      this.router.navigate(['main/home']);
      return false;
    }

    if (merchant.isClosed || (this.hasAddress && !merchant.onSchedule)) {
      alert(breakHint);
      return false;
    }

    if (merchant.orderEnded) {
      alert(overTimeHint + this.restaurant.orderEndTime + 'am');
      return false;
    }
    return true;
  }

  addToCart(p: IProduct) {
    if (!this.isValidProduct(p)) {
      return;
    }

    const origin = this.delivery.origin;
    if (origin) {
      this.add.emit({
        items: [{
          productId: p._id,
          productName: p.name,
          price: p.price,
          cost: p.cost,
          quantity: 1,
          pictures: p.pictures,
          merchantId: p.merchantId, // merchant account id
          merchantName: this.lang === 'en' ? p.merchant.nameEN : p.merchant.name
        }],
        merchantId: p.merchantId, // merchant account id
        merchantName: this.lang === 'en' ? p.merchant.nameEN : p.merchant.name
      });
    }
  }

  removeFromCart(p: IProduct) {
    this.remove.emit({
          items: [{
            productId: p._id,
            productName: p.name,
            price: p.price,
            cost: p ? p.cost : 0,
            quantity: 1,
            pictures: p.pictures,
            merchantId: p.merchantId,
            merchantName: this.lang === 'en' ? p.merchant.nameEN : p.merchant.name
          }],
          merchantId: p.merchantId,
          merchantName: this.lang === 'en' ? p.merchant.nameEN : p.merchant.name
        });
  }

  getProductImage(p: Product) {
    if (p.pictures && p.pictures[0] && p.pictures[0].url) {
      return environment.MEDIA_URL + p.pictures[0].url;
    } else {
      return null;
    }
  }

  onQuantityChanged(v, product: IProduct) {
    if (!this.isValidProduct(product)) {
      return;
    }
    let quantity = 0;
    if (!isNaN(parseInt(v, 10))) {
      quantity = parseInt(v, 10) >= 0 ? parseInt(v, 10) : 0;
    }
    this.setquantity.emit({
      items: [{
        productId: product._id,
        productName: product.name,
        price: product.price,
        cost: product.cost,
        quantity,
        pictures: product.pictures,
        merchantId: product.merchantId,
        merchantName: this.lang === 'en' ? product.merchant.nameEN : product.merchant.name
      }],
    });
    // this.rx.dispatch({
    //   type: CartActions.UPDATE_QUANTITY,
    //   payload: {
    //     items: [{
    //       productId: p._id,
    //       productName: p.name,
    //       price: p.price,
    //       quantity: quantity,
    //       pictures: p.pictures,
    //       cost: p ? p.cost : 0,
    //       merchantId: p.merchantId,
    //       merchantName: this.lang === 'en' ? p.merchant.nameEN : p.merchant.name
    //     }]
    //   }
    // });
  }

  getImageSrc(p) {
    if (p.fpath) {
      return this.MEDIA_URL + p.fpath;
    } else {
      return this.MEDIA_URL + ADD_IMAGE;
    }
  }

  // select product for specification
  onSelect(product: IProduct) {
    if (!this.isValidProduct(product)) {
      return;
    }
    this.select.emit({
      selectedProduct: product
    });
  }

  // check if a product has any specification
  hasSpecification(product): boolean {
    return product.specifications && product.specifications.length;
  }

  getProductItemPrice(product: IProduct): string {
    const cartItem = this.cart.items.find(item => item.productId === product._id);
    if (cartItem) {
      return CartItem.calcPrice(cartItem).toFixed(2);
    } else {
      return Product.calcPrice(product).toFixed(2);
    }
  }

}

