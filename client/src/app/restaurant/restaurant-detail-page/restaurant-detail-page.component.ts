import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../product/product.service';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { Restaurant } from '../restaurant.model';
import { Product, IProduct } from '../../product/product.model';

@Component({
  selector: 'app-restaurant-detail-page',
  templateUrl: './restaurant-detail-page.component.html',
  styleUrls: ['./restaurant-detail-page.component.scss']
})
export class RestaurantDetailPageComponent implements OnInit {
  categories;
  groupedProducts: any = [];
  restaurant: any;
  subscription;
  cart;
  tabs = [{ code: 'menu', text: 'Menu' }, { code: 'ratings', text: 'Rating' }, { code: 'about', text: 'About' }];
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

  groupByCategory(products: IProduct[]) {
    const self = this;
    return products.reduce( (r, p: IProduct) => {
      const catId = p.categoryId;
      p.restaurant = self.restaurant; // fix me
      r[catId] = r[catId] || [];
      r[catId].push(p);
      return r;
    }, Object.create(null));
  }

  // onAddressChange(e) {
  //   const self = this;
  //   this.bHideMap = true;
  //   this.bRestaurant = false;
  //   this.bTimeOptions = false;
  //   this.options = [];
  //   this.locationSvc.reqPlaces(e.input).subscribe((ps: IPlace[]) => {
  //     if (ps && ps.length > 0) {
  //       for (const p of ps) {
  //         const loc: ILocation = this.getLocation(p);
  //         self.options.push({ location: loc, type: 'suggest' }); // without lat lng
  //       }
  //     }
  //   });
  //   // localStorage.setItem('location-' + APP, JSON.stringify(e.addr));
  //   // this.sharedSvc.emitMsg({name: 'OnUpdateAddress', addr: e.addr});
  //   this.mapFullScreen = false;
  // }

  // onAddressClear(e) {
  //   this.deliveryAddress = '';
  //   this.mapFullScreen = true;
  //   this.options = [];
  //   this.bHideMap = false;
  //   this.bRestaurant = false;
  // }
}

