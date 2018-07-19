import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Product } from '../../commerce/commerce';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { ICart, CartActions } from '../../commerce/commerce.actions';
import { ProductService } from '../../product/product.service';

@Component({
    selector: 'app-manage-product-list-page',
    templateUrl: './manage-product-list-page.component.html',
    styleUrls: ['./manage-product-list-page.component.scss']
})
export class ManageProductListPageComponent implements OnInit {
    products: Product[];
    constructor(private route: ActivatedRoute,
        private productSvc: ProductService,
        private rx: NgRedux<IAppState>) {
        const self = this;

        this.route.queryParams.subscribe(params => {
            const restaurant_id = params['restaurant_id'];
            self.productSvc.getProductList('?restaurant_id=' + restaurant_id).subscribe(
                (ps: Product[]) => {
                    self.products = ps;
                });
        });
    }

    ngOnInit() {
    }

}
