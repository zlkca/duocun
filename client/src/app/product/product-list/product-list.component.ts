import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../product.service';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { Product } from '../../lb-sdk';

const ADD_IMAGE = 'add_photo.png';

@Component({
  providers: [ProductService],
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  MEDIA_URL: string = environment.MEDIA_URL;

  @Input() restaurantId;
  @Input() products: Product[];
  @Input() mode: string;
  @Output() select = new EventEmitter();
  @Output() afterDelete = new EventEmitter();
  selected = null;

  ngOnInit() {

  }

  constructor(private productSvc: ProductService,
    private router: Router,
    private rx: NgRedux<IAppState>
    // private actions: CartActions
  ) {

    // this.subscription = ngRedux.select<ICart>('cart').subscribe(
    //   cart=> this.cart = cart);
  }

  onClick(p) {
    // if (this.mode == 'edit') {

    // } else {
    //     this.router.navigate(["product/" + p.id]);
    // }
  }

  // addToCart(p) {
  //     this.rx.dispatch({
  //         type: CartActions.ADD_TO_CART, payload:
  //             { pid: p.id, name: p.name, price: p.price, restaurant_id: p.restaurant.id }
  //     });
  // }

  // removeFromCart(p) {
  //     this.rx.dispatch({ type: CartActions.REMOVE_FROM_CART,
  //         payload: { pid: p.id, name: p.name, price: p.price, restaurant_id: p.restaurant.id } });
  // }

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

  change(p: Product) {
    this.router.navigate(['admin/products/' + p.id]);
  }

  add() {
    // this.router.navigate(['admin/product']);
    this.router.navigate(['admin/product'], { queryParams: { restaurant_id: this.restaurantId } });
  }

  delete(p) {
    const self = this;
    this.productSvc.deleteById(p.id).subscribe(x => {
      self.selected = null;
      self.afterDelete.emit({ product: p });
    });
  }
}

