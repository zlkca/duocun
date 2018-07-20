import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Product } from '../../shared/lb-sdk';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { ProductService } from '../../product/product.service';


@Component({
    selector: 'app-admin-product-form-page',
    templateUrl: './admin-product-form-page.component.html',
    styleUrls: ['./admin-product-form-page.component.scss']
})
export class AdminProductFormPageComponent implements OnInit {
    product: Product;

    constructor(private productSvc: ProductService,
        private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        const self = this;

        self.route.params.subscribe((params: any) => {
            if (params.id) {
                this.productSvc.findById(params.id).subscribe(
                    (p: Product) => {
                        self.product = p;
                    });
            } else {
                self.product = new Product();
                self.product.pictures = [{ index: 0, image: { index: 0, data: 'add_photo.png', file: '' } }];
            }
        });
    }
}
