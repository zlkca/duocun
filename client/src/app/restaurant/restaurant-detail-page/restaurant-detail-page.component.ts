import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../product/product.service';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { Restaurant } from '../restaurant.model';
import { IProduct } from '../../product/product.model';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
import { CategoryService } from '../../category/category.service';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';

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
  onDestroy$ = new Subject<any>();

  constructor(
    private productSvc: ProductService,
    private categorySvc: CategoryService,
    private restaurantSvc: RestaurantService,
    private route: ActivatedRoute,
    private rx: NgRedux<IAppState>
    // private actions: CartActions
  ) {
    const self = this;
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'restaurant-detail'
    });

  }

  ngOnInit() {
    const self = this;
    self.route.params.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(params => {
      const merchantId = params['id'];
      self.restaurantSvc.findById(merchantId, { include: ['pictures', 'address'] }).subscribe(
        (restaurant: Restaurant) => {
          self.restaurant = restaurant;
        },
        (err: any) => {
          self.restaurant = null;
        }
      );

      self.productSvc.find({where: {merchantId: merchantId}}).subscribe(products => {
      // self.restaurantSvc.getProducts(merchantId).subscribe(products => {
        self.groupedProducts = self.groupByCategory(products);
        const categoryIds = Object.keys(self.groupedProducts);

        // fix me !!!
        self.categorySvc.find({where: {id: {$in: categoryIds}}}).subscribe(res => {
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

  onAfterCheckout(e) {

  }
}

