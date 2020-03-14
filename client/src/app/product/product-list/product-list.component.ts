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
import {Cart, CartItem} from '../../cart/cart.model';
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
  cart: Cart;
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
    this.rx.select<Cart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: Cart) => {
      this.cart = cart;
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((x: IDelivery) => {
      this.delivery = x;
    });
  }

  isValidAction() {
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

  addItemToCart(p: IProduct|CartItem) {
    if (!this.isValidAction()) {
      return;
    }
    const origin = this.delivery.origin;
    if (origin) {
      this.add.emit({
        items: [ p instanceof CartItem ? p : CartItem.getDefault(p, this.restaurant)]
      });
    }
  }

  getProductPrice(p: IProduct): number {
    return Product.calcPrice(p);
  }

  removeItemFromCart(p: IProduct|CartItem) {
    this.remove.emit({
        items: [ p instanceof CartItem ? p : CartItem.getDefault(p, this.restaurant) ]
    });
  }

  getProductImage(p: Product) {
    if (p.pictures && p.pictures[0] && p.pictures[0].url) {
      return environment.MEDIA_URL + p.pictures[0].url;
    } else {
      return null;
    }
  }

  onQuantityChanged(v: number, p: IProduct|CartItem) {
    if (!this.isValidAction()) {
      return;
    }
    const cartItem = p instanceof CartItem ? p : CartItem.getDefault(p, this.restaurant);
    cartItem.quantity = v;
    this.setquantity.emit({
      items: [ cartItem ],
    });
  }

  getImageSrc(p) {
    if (p.fpath) {
      return this.MEDIA_URL + p.fpath;
    } else {
      return this.MEDIA_URL + ADD_IMAGE;
    }
  }

  // select product for specification
  onSelect(p: IProduct, item?: CartItem) {
    if (!this.isValidAction()) {
      return;
    }
    const selectedCartItem = item ? item : CartItem.getDefault(p, this.restaurant);
    selectedCartItem.quantity = this.cart.getItemQuantity(selectedCartItem);
    this.select.emit({
      selectedProduct: p,
      selectedCartItem
    });
  }

  defaultCartItem(product): CartItem {
    return CartItem.getDefault(product, this.restaurant);
  }

  getCartItemQuantity(cartItem: CartItem) {
    return this.cart.getItemQuantity(cartItem);
  }
  getDefaultItemQuantity(product): number {
    return this.getCartItemQuantity(this.defaultCartItem(product));
  }
  getNonDefaultCartItems(product): Array<CartItem> {
    return this.cart.getNonDefaultCartItems(product, this.restaurant);
  }
  // check if a product has any specification
  hasSpecification(product): boolean {
    return product.specifications && product.specifications.length;
  }
}
