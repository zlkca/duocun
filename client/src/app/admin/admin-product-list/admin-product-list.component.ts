import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { Product } from '../../product/product.model';
const ADD_IMAGE = 'add_photo.png';
const MEDIA_URL: string = environment.MEDIA_URL;

@Component({
    selector: 'app-admin-product-list',
    templateUrl: './admin-product-list.component.html',
    styleUrls: ['./admin-product-list.component.scss']
})
export class AdminProductListComponent implements OnInit {
    placeholder = MEDIA_URL + ADD_IMAGE;
    subscription: any;
    product;

    @Input() products;
    @Input() restaurantId;
    @Output() select = new EventEmitter();

    ngOnInit() {

    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private rx: NgRedux<IAppState>) {
        const self = this;

    }

    onSelect(p) {
      this.select.emit({ product: p });
    }

    change(p: Product) {
        this.router.navigate(['admin/products/' + p.id]);
    }

    add() {
        // this.router.navigate(['admin/product']);
        this.router.navigate(['admin/product'], { queryParams: { restaurant_id: this.restaurantId } });
    }

    getImageSrc(p) {
        if (p.fpath) {
            return MEDIA_URL + p.fpath;
        } else {
            return MEDIA_URL + ADD_IMAGE;
        }
    }

}

