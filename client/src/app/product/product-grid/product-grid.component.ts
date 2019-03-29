import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IAppState } from '../../store';
import { CartActions, ICart, ICartItem } from '../../order/order.actions';
import { SharedService } from '../../shared/shared.service';
import { Product } from '../../lb-sdk';

const ADD_IMAGE = 'add_photo.png';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent implements OnInit, OnChanges {

  MEDIA_URL: string = environment.MEDIA_URL;
  defaultProductPicture = window.location.protocol + '//placehold.it/400x300';
  subscription: any;
  cart: any;
  categoryIds;
  groupedOrders: any = {};

  @Input() categories;
  @Input() groupedProducts: Product[][];
  @Input() mode: string;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private rx: NgRedux<IAppState>,
    private sharedSvc: SharedService
    // private actions: CartActions
  ) {
    rx.select<ICart>('cart').subscribe((cart: ICart) => {
      this.cart = cart;
      if(this.groupedProducts) {
        const categoryIds = Object.keys(this.groupedProducts);
        categoryIds.map(categoryId => {
          this.groupedOrders[categoryId].map(order => {
            const cartItem = cart.items.find(item => item.productId === order.productId);
            order.quantity = cartItem ? cartItem.quantity : 0;
          });
        });
      }
    });
  }

  ngOnInit() {

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
          const cartItem = this.cart.items.find( item => { return item.productId === product.id});
          if(cartItem){
            orders.push({productId: product.id, quantity: cartItem.quantity});
          }else{
            orders.push({productId: product.id, quantity: 0});
          }
        });
        
        this.groupedOrders[categoryId] = orders;// product array categoryId;
      });

      if (gps.length > 0) {
        this.categoryIds = Object.keys(this.groupedProducts);
      }
    }
  }

  addToCart(p: Product) {
    this.rx.dispatch({
      type: CartActions.ADD_TO_CART, payload:
        { productId: p.id, name: p.name, price: p.price, pictures: p.pictures, restaurantId: p.restaurantId }
    });
  }

  removeFromCart(p: Product) {
    this.rx.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: { productId: p.id, name: p.name, price: p.price, pictures: p.pictures, restaurantId: p.restaurantId }
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
