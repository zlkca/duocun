import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Product } from '../../shared/lb-sdk';
import { environment } from '../../../environments/environment';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { RestaurantService } from '../../restaurant/restaurant.service';

@Component({
  selector: 'app-admin-product-page',
  templateUrl: './admin-product-page.component.html',
  styleUrls: ['./admin-product-page.component.scss']
})
export class AdminProductPageComponent implements OnInit {
  products;
  restaurantId;
  product;

  constructor(private route: ActivatedRoute,
      private restaurantSvc: RestaurantService,
      private rx: NgRedux<IAppState>) {

  }

  ngOnInit() {
    this.loadProductList();
  }

  add() {
    this.product = new Product();
  }

  onAfterSave(event) {
    this.loadProductList();
  }

  onAfterDelete(event) {
    this.loadProductList();
    this.product = new Product();
    this.product.id = null;
    this.product.name = '';
    this.product.description = '';
    this.product.price = null;
    this.product.restaurantId = null;
  }

  onSelect(event) {
    this.product = event.product;
  }

  loadProductList() {
    const self = this;
    this.route.queryParams.subscribe(params => {
        self.restaurantId = params['restaurant_id'];
        self.restaurantSvc.getProducts(self.restaurantId).subscribe(
            (ps: Product[]) => {
                self.products = ps;
            });
    });
  }

}
