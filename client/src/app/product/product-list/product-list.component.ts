import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../../commerce/commerce';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { ICart, CartActions } from '../../commerce/commerce.actions';

const ADD_IMAGE = 'add_photo.png';

@Component({
    providers: [ProductService],
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
    productList: Product[] = [];
    MEDIA_URL: string = environment.MEDIA_URL;
    subscription: any;
    cart: any;

    @Input() products: Product[];
    @Input() mode: string;

    ngOnInit() {
        const self = this;
        this.productSvc.find().subscribe(
            (r: Product[]) => {
                self.productList = r;
            },
            (err: any) => {
                self.productList = [];
            });
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
}

