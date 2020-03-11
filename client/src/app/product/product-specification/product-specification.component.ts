import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IProduct, Product} from '../product.model';
import {NgRedux} from '@angular-redux/store';
import {IAppState} from '../../store';
import {CartItem, ICart, ICartItem, ICartItemSpec} from '../../cart/cart.model';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CartActions} from '../../cart/cart.actions';
import { IMerchant } from '../../merchant/merchant.model';
import {environment} from '../../../environments/environment';
import {Specification} from '../../specification/specification.model';


@Component({
  selector: 'app-product-specification',
  templateUrl: './product-specification.component.html',
  styleUrls: ['./product-specification.component.scss']
})

export class ProductSpecificationComponent implements OnInit, OnDestroy {
  @Input() restaurant: IMerchant;
  cart: ICart;
  cartItem: ICartItem;
  onDestroy$ = new Subject();
  product: IProduct;
  lang = environment.language;
  constructor(
    private rx: NgRedux<IAppState>
  ) {
    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
      this.product = cart.selectedProduct;
    });
  }

  ngOnInit() {
    this.cartItem = this.getCartItemForSpec(this.cart);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
  cancelSpecSelect(event: Event) {
    event.preventDefault();
    this.rx.dispatch({
      type: CartActions.CANCEL_SPEC_SELECT,
      payload: {}
    });
  }
  upCartItemQuantity() {
    this.cartItem.quantity = this.cartItem.quantity + 1;
  }
  downCartItemQuantity() {
    this.cartItem.quantity = this.cartItem.quantity > 0 ? this.cartItem.quantity - 1 : 0;
  }
  setCartItemQuantity(val: any) {
    let quantity = parseInt(val, 10);
    if (isNaN(quantity)) {
      quantity = 0;
    }
    this.cartItem.quantity = quantity;
  }
  singleSpecs(): Array<any> {
    return Product.singleSpec(this.product);
  }
  multipleSpecs(): Array<any> {
    return Product.multipleSpec(this.product);
  }
  getCartItemForSpec(cart: ICart): ICartItem {
    const item = cart.items.find(cartItem => {
      return cartItem.productId === this.product._id;
    });
    if (item) {
      return item;
    } else {
      const defaultItem = {
        productId: this.product._id,
        productName: this.product.name,
        merchantId: this.product.merchantId,
        merchantName: this.lang === 'en' ? this.restaurant.nameEN: this.restaurant.name,
        price: this.product.price,
        cost: this.product.cost,
        quantity: 1,
        spec: []
      };
      // set default specifications
      this.product.specifications.forEach(spec => {
        const defaultDetail = Specification.getDefaultDetail(spec);
        if (defaultDetail) {
          defaultItem.spec.push({
            specId: spec._id,
            specName: spec.name,
            type: spec.type,
            list: [{
              name: defaultDetail.name,
              nameEN: defaultDetail.nameEN,
              price: defaultDetail.price,
              cost: defaultDetail.cost,
              quantity: 1
            }]
          });
        }
      });
      return defaultItem;
    }

  }
  getSpecDetailQuantity(spec, specDetail): number {
    if (!this.cartItem || !this.cartItem.spec) {
      return 0;
    }
    // find cart item spec by specification id
    const checkedSpec = this.cartItem.spec.find(cartItemSpec => {
      return cartItemSpec.specId === spec._id;
    });
    if (!checkedSpec || !checkedSpec.list) {
      return 0;
    }
    // find cart item spec list by list name
    const checkedSpecDetail = checkedSpec.list.find(cartItemSpecDetail => {
      return cartItemSpecDetail.name === specDetail.name;
    });
    if (checkedSpecDetail) {
      if (spec.type === 'single') {
        return 1;
      } else {
        return checkedSpecDetail.quantity || 0;
      }
    } else {
      return 0;
    }
  }
  setSpecDetailQuantity(spec, specDetail, quantity) {
    if (!this.cartItem) {
      return false;
    }
    if (!this.cartItem.spec) {
      this.cartItem.spec = [];
    }
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity)) {
      quantity = 0;
    }
    // find cart item spec index by specification id
    const specIndex = this.cartItem.spec.findIndex(cartItemSpec => {
      return cartItemSpec.specId === spec._id;
    });
    // if specification exists
    if (specIndex >= 0) {
      const cartItemSpec = this.cartItem.spec[specIndex];
      // if specification is single type we need to set only first item
      if (spec.type === 'single') {
        if (quantity > 0) {
          cartItemSpec.list = [{
            name: specDetail.name,
            nameEN: specDetail.nameEN,
            price: specDetail.price,
            cost: specDetail.cost,
            quantity
          }];
        } else {
          this.cartItem.spec.splice(specIndex, 1);
        }
        // console.log(this.cartItem);
        return;
      }
      if (!cartItemSpec.list) {
        cartItemSpec.list = [];
      }
      // find cart item spec list index by list name
      const cartItemDetailIndex = cartItemSpec.list.findIndex(cartItemSpecDetail => {
        return cartItemSpecDetail.name === specDetail.name;
      });
      // if cart item spec list detail exists
      if (cartItemDetailIndex >= 0) {
        // if quantity is above zero, set it
        if (quantity > 0) {
          cartItemSpec.list[cartItemDetailIndex].quantity = quantity;
        } else {
          // if quantity is zero, remove it
          cartItemSpec.list.splice(cartItemDetailIndex, 1);
          // if cart item list becomes an empty array by removing a detail, remove the specification itself
          if (!cartItemSpec.list.length) {
            this.cartItem.spec.splice(specIndex, 1);
          }
        }
      } else {
        if (quantity > 0) {
          cartItemSpec.list.push({
            name: specDetail.name,
            nameEN: specDetail.nameEN,
            price: specDetail.price,
            cost: specDetail.cost,
            quantity
          });
        }
      }
    // if specification does not exist in cart item
    } else {
      // if quantity is above zero push new specifcation and detail
      if (quantity > 0) {
        this.cartItem.spec.push({
          specId: spec._id,
          specName: spec.name,
          type: spec.type,
          list: [{
            name: specDetail.name,
            nameEN: specDetail.nameEN,
            price: specDetail.price,
            cost: specDetail.cost,
            quantity: quantity
          }]
        });
      }
    }
    // console.log(this.cartItem);
  }
  // when you toggle an option or a checkbox
  toggleSpecDetail(event, spec, detail): void {
      if (event.target.checked) {
        this.setSpecDetailQuantity(spec, detail, 1);
      } else {
        this.setSpecDetailQuantity(spec, detail, 0);
      }
  }
  getCartItemSubtotal(): string {

    return CartItem.calcSubtotal(this.cartItem).toFixed(2);
  }
  addToCart(): void {
    const confirmMsg = this.lang === 'en' ? 'Do you want to save selected specification?' : '您需要保留已选好的规格和配菜么？';
    this.rx.dispatch({
      type: CartActions.UPDATE_QUANTITY,
      payload: { items: [this.cartItem]}
    });
    this.rx.dispatch({
      type: CartActions.CANCEL_SPEC_SELECT,
      payload: {}
    });
  }
}
