import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IAppState } from '../../store';
import { CartActions } from '../../order/order.actions';
import { SharedService } from '../../shared/shared.service';
import { Product } from '../../lb-sdk';

const ADD_IMAGE = 'add_photo.png';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent implements OnInit {
  productList: Product[] = [];
  MEDIA_URL: string = environment.MEDIA_URL;
  defaultPicture = window.location.protocol + '//placehold.it/400x300';
  subscription: any;
  cart: any;

  @Input() products: Product[];
  @Input() mode: string;

  ngOnInit() {
  }

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private ngRedux: NgRedux<IAppState>,
    private sharedSvc: SharedService
    // private actions: CartActions
  ) {
    // this.subscription = ngRedux.select<ICart>('cart').subscribe(
    //   cart=> this.cart = cart);
  }

  addToCart(p) {
    this.ngRedux.dispatch({
      type: CartActions.ADD_TO_CART, payload:
        { productId: p.id, name: p.name, price: p.price, restaurantId: p.restaurantId }
    });
  }

  removeFromCart(p) {
    this.ngRedux.dispatch({
      type: CartActions.REMOVE_FROM_CART,
      payload: { productId: p.id, name: p.name, price: p.price, restaurantId: p.restaurantId }
    });
  }

  getImageSrc(p) {
    if (p.pictures && p.pictures[0] && p.pictures[0].url) {
      return this.sharedSvc.getMediaUrl() + p.pictures[0].url;
    } else {
      return this.defaultPicture;
    }
  }

}
