import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IProduct, Product} from '../product.model';
import {NgRedux} from '@angular-redux/store';
import {IAppState} from '../../store';
import {Cart, CartItem, CartItemSpec, ICart, ICartItem, CartItemSpecDetail} from '../../cart/cart.model';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CartActions} from '../../cart/cart.actions';
import { IMerchant } from '../../merchant/merchant.model';
import {environment} from '../../../environments/environment';
import {ISpecification, ISpecificationDetail, Specification} from '../../specification/specification.model';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ProductSpecConfirmModalComponent} from '../product-spec-confirm-modal/product-spec-confirm-modal.component';
import {CartService} from '../../cart/cart.service';
@Component({
  selector: 'app-product-specification',
  templateUrl: './product-specification.component.html',
  styleUrls: ['./product-specification.component.scss']
})

export class ProductSpecificationComponent implements OnInit, OnDestroy {
  @Input() restaurant: IMerchant;
  cart: Cart;
  product: Product;
  item: CartItem;
  onDestroy$ = new Subject();
  lang = environment.language;
  closeResult: string;
  constructor(
    private rx: NgRedux<IAppState>,
    private dialog: MatDialog
  ) {
    this.rx.select<Cart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: Cart) => {
      this.cart = cart;
      this.product = new Product(cart.selectedProduct);
      // copy so we can cancel changes
      this.item = cart.selectedCartItem;
      if (this.item.quantity < 1) {
        this.item.quantity = 1;
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
  ngOnInit(): void {
  }

  cancelSpecSelect(event: Event) {
    event.preventDefault();
    this.rx.dispatch({
      type: CartActions.CANCEL_SPEC_SELECT,
      payload: {}
    });
  }
  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ProductSpecConfirmModalComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(action => {
      switch (action) {
        case 'save':
          this.rx.dispatch({
            type: CartActions.REMOVE_FROM_CART,
            payload: { items: [this.cart.selectedCartItem] }
          });
          this.rx.dispatch({
            type: CartActions.UPDATE_QUANTITY,
            payload: { items: [this.item] }
          });
          this.rx.dispatch({
            type: CartActions.CANCEL_SPEC_SELECT,
            payload: {}
          });
          break;
        case 'clear':
          if (!(this.cart.selectedCartItem.equals(CartItem.getDefault(this.cart.selectedProduct, this.restaurant)))) {
            this.rx.dispatch({
              type: CartActions.REMOVE_FROM_CART,
              payload: {
                items: [this.cart.selectedCartItem]
              }
            });
          }
          this.rx.dispatch({
            type: CartActions.CANCEL_SPEC_SELECT,
            payload: {}
          });
          break;
        default:
          break;
      }
    });
  }
  upCartItemQuantity() {
    this.item.quantity = this.item.quantity + 1;
    console.log('upcartitemquantity: ', this.item, this.item.quantity)
  }
  downCartItemQuantity() {
    this.item.quantity = this.item.quantity > 0 ? this.item.quantity - 1 : 0;
    console.log('downcartitemquantity: ', this.item, this.item.quantity)
  }
  setCartItemQuantity(val: any) {
    let quantity = parseInt(val, 10);
    if (isNaN(quantity)) {
      quantity = 0;
    }
    this.item.quantity = quantity;
  }
  getCartItemForSpec(cart: Cart): CartItem {
    const item = cart.findByItem(this.item);
    if (item) {
      // returns copy of the item
      return new CartItem(item);
    } else {
      return CartService.getDefaultCartItem(this.product, this.restaurant, this.lang);
    }
  }
  getSpecDetailQuantity(spec: ISpecification, specDetail: ISpecificationDetail): number {
    const itemSpecDetail = this.item.findNestedItemByTypes(spec, specDetail);
    return itemSpecDetail ? itemSpecDetail.quantity : 0;
  }
  setSpecDetailQuantity(spec: ISpecification, specDetail: ISpecificationDetail, quantity: number) {
    this.item.setItemQuantity(spec, specDetail, quantity);
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
    return this.item.totalPrice().toFixed(2);
  }
}
