import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../product/product.service';
import { AuthService } from '../../account/auth.service';
import { environment } from '../../../environments/environment';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { Restaurant, Product } from '../../lb-sdk';


@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent implements OnInit {

  categories;
  groupedProducts: any = [];
  restaurant: any;
  subscription;
  cart;

  constructor(private productSvc: ProductService,
    private restaurantSvc: RestaurantService,
    private route: ActivatedRoute,
    // private ngRedux:NgRedux<IAppState>,
    // private actions: CartActions
  ) {

    // this.subscription = ngRedux.select<ICartItem[]>('cart').subscribe(
    //   cart=> this.cart = cart);

    // let self = this;
  }

  ngOnInit() {
    const self = this;
    self.route.params.subscribe(params => {
      const restaurantId = params['id'];
      self.restaurantSvc.findById(restaurantId, { include: ['pictures', 'address'] }).subscribe(
        (restaurant: Restaurant) => {
          self.restaurant = restaurant;
        },
        (err: any) => {
          self.restaurant = null;
        }
      );

      self.productSvc.find({where: {restaurantId: restaurantId}}).subscribe(products => {
      // self.restaurantSvc.getProducts(restaurantId).subscribe(products => {
        self.groupedProducts = self.groupByCategory(products);
        const categoryIds = Object.keys(self.groupedProducts);
        self.productSvc.findCategories({where: {id: { inq: categoryIds}}}).subscribe(res => {
          self.categories = res;
        });
      });
    });
  }

  groupByCategory(products: Product[]) {
    return products.reduce( (r, p: Product) => {
      const catId = p.categoryId;
      r[catId] = r[catId] || [];
      r[catId].push(p);
      return r;
    }, Object.create(null));
  }
}