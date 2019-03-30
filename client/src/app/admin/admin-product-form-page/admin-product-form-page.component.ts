import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Product } from '../../product/product.model';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { ProductService } from '../../product/product.service';
import { AccountService } from '../../account/account.service';


@Component({
    selector: 'app-admin-product-form-page',
    templateUrl: './admin-product-form-page.component.html',
    styleUrls: ['./admin-product-form-page.component.scss']
})
export class AdminProductFormPageComponent implements OnInit {
    product;
    account;
    subscrAccount;
    restaurantId;

    constructor(
        private accountSvc: AccountService,
        private productSvc: ProductService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit() {
        const self = this;
        this.subscrAccount = this.accountSvc.getCurrent().subscribe(account => {
            self.account = account;
        });

        this.route.queryParams.subscribe(params => {
            self.restaurantId = params['restaurant_id'];
        });

        self.route.params.subscribe((params: any) => {
            const productId = params.id;
            if (productId) {
                this.productSvc.findById(productId, { include: 'pictures' }).subscribe(
                    (p: Product) => {
                        self.product = p;
                    });
            } else {
                self.product = new Product();
                if (!self.restaurantId) {
                    self.restaurantId = this.account.restaurants[0].id;
                }
                self.product = {
                    restaurantId: self.restaurantId,
                };
                // self.product.pictures = [{ index: 0, image: { index: 0, data: 'add_photo.png', file: '' } }];
            }
        });
    }

    onAfterSave(event) {
        const restaurantId = event.restaurant_id;
        if (this.account.type === 'super') {
            this.router.navigate(['admin/products'], { queryParams: { restaurant_id: restaurantId } });
        } else if (this.account.type === 'business') {
            this.router.navigate(['admin']);
        }
    }
}
