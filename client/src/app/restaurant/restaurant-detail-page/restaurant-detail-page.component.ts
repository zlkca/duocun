import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

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
import { MatDialog } from '../../../../node_modules/@angular/material';
import { QuitRestaurantDialogComponent } from '../quit-restaurant-dialog/quit-restaurant-dialog.component';
import { ICart } from '../../cart/cart.model';
import { SharedService } from '../../shared/shared.service';
import * as moment from 'moment';
import { IDeliveryTime, IDelivery } from '../../delivery/delivery.model';

@Component({
  selector: 'app-restaurant-detail-page',
  templateUrl: './restaurant-detail-page.component.html',
  styleUrls: ['./restaurant-detail-page.component.scss']
})
export class RestaurantDetailPageComponent implements OnInit, OnDestroy {
  categories;
  groupedProducts: any = [];
  restaurant: any;
  subscription;
  cart: ICart;
  onDestroy$ = new Subject<any>();
  locationSubscription;
  dow: number; // day of week

  constructor(
    private productSvc: ProductService,
    private categorySvc: CategoryService,
    private restaurantSvc: RestaurantService,
    private route: ActivatedRoute,
    private rx: NgRedux<IAppState>,
    private location: Location,
    public dialog: MatDialog
  ) {
    const self = this;
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'restaurant-detail'
    });

    this.rx.select<IDelivery>('delivery').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((t: IDelivery) => {
      if (t) {
        this.dow = moment(t.fromTime).day();
      }
    });

    this.rx.select<ICart>('cart').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((cart: ICart) => {
      this.cart = cart;
    });

    this.locationSubscription = this.location.subscribe((x) => {
      if (window.location.pathname.endsWith('restaurant/list')) {
        // window.history.forward();
        if (self.restaurant && self.cart && self.cart.items && self.cart.items.length > 0) {
          this.openDialog(self.restaurant.id, 'restaurant-list');
        }
      } else if (window.location.pathname.endsWith('order/history')) {
        if (self.restaurant && self.cart && self.cart.items && self.cart.items.length > 0) {
          this.openDialog(self.restaurant.id, 'order-history');
        }
      }
    });
  }

  ngOnInit() {
    const self = this;
    self.route.params.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(params => {
      const merchantId = params['id'];
      self.restaurantSvc.findById(merchantId, { include: ['pictures', 'address'] }).pipe(
        takeUntil(this.onDestroy$)
      ).subscribe(
        (restaurant: Restaurant) => {
          self.restaurant = restaurant;
        },
        (err: any) => {
          self.restaurant = null;
        }
      );

      self.productSvc.find({ where: { merchantId: merchantId, dow: this.dow } }).pipe(
        takeUntil(this.onDestroy$)
      ).subscribe(products => {
        // self.restaurantSvc.getProducts(merchantId).subscribe(products => {
        self.groupedProducts = self.groupByCategory(products);
        const categoryIds = Object.keys(self.groupedProducts);

        // fix me !!!
        self.categorySvc.find({ where: { id: { $in: categoryIds } } }).pipe(
          takeUntil(this.onDestroy$)
        ).subscribe(res => {
          self.categories = res;
        });
      });
    });
  }

  ngOnDestroy() {
    this.locationSubscription.unsubscribe();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  openDialog(merchantId: string, fromPage: string): void {
    const dialogRef = this.dialog.open(QuitRestaurantDialogComponent, {
      width: '300px',
      data: {
        title: '提示', content: '离开后将清空购物车。', buttonTextNo: '离开', buttonTextYes: '留下',
        merchantId: merchantId, fromPage: fromPage
      },
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(result => {
    });
  }

  groupByCategory(products: IProduct[]) {
    const self = this;
    return products.reduce((r, p: IProduct) => {
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

