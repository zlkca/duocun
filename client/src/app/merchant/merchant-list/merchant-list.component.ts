import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { MerchantService } from '../merchant.service';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { IMerchant, MerchantType } from '../../merchant/merchant.model';
import { environment } from '../../../environments/environment';
import { Router } from '../../../../node_modules/@angular/router';
import { Subject } from '../../../../node_modules/rxjs';
import { ILocation } from '../../location/location.model';
import { DistanceService } from '../../location/distance.service';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
import { RestaurantActions } from '../../restaurant/restaurant.actions';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { CartActions } from '../../cart/cart.actions';
import { ICart } from '../../cart/cart.model';

@Component({
  selector: 'app-merchant-list',
  templateUrl: './merchant-list.component.html',
  styleUrls: ['./merchant-list.component.scss']
})
export class MerchantListComponent implements OnInit, OnDestroy, OnChanges {

  @Input() phase; // string 'today:lunch', 'tomorrow:lunch'
  @Input() address; // ILocation
  @Input() active;
  @Input() bAddressList;

  onDestroy$ = new Subject();
  markers;
  restaurants;
  defaultPicture = window.location.protocol + '//placehold.it/400x300';
  malls;
  loading = true;
  origin;
  bHasAddress = false;
  cart;

  constructor(
    private merchantSvc: MerchantService,
    private distanceSvc: DistanceService,
    private router: Router,
    private rx: NgRedux<IAppState>
  ) {
    this.rx.select<ICart>('cart').pipe(takeUntil(this.onDestroy$)).subscribe((cart: ICart) => {
      this.cart = cart;
    });
  }

  ngOnChanges(d) { // this is run before ngOnInit
    if (d.address) {
      // this.origin = d.address.currentValue;
      // if (!this.origin) {
      //   return;
      // }

      if (d.bAddressList && d.bAddressList.currentValue) {
        return;
      }
    }

    if (this.phase) {
      if (this.address) {
        this.origin = this.address;
      }

      this.loading = true;
      this.loadRestaurants(this.origin, this.phase); // this.origin could be empty
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.loading = true;
    this.loadRestaurants(this.address, this.phase);
  }

  // -----------------------------------------------------
  // phase --- string 'today:lunch', 'tomorrow:lunch'
  loadRestaurants(origin: ILocation, phase: string) {
    const self = this;
    const dateType = phase.split(':')[0];
    const query = { status: 'active', type: MerchantType.RESTAURANT };
    if (origin) {
      this.bHasAddress = true;
      this.merchantSvc.load(origin, dateType, query).pipe(takeUntil(self.onDestroy$)).subscribe(rs => {
        rs.map((restaurant: IMerchant) => {
          if (environment.language === 'en') {
            restaurant.name = restaurant.nameEN;
          }
          restaurant.distance = restaurant.distance / 1000;
          restaurant.fullDeliveryFee = self.distanceSvc.getDeliveryCost(restaurant.distance);
          restaurant.deliveryCost = self.distanceSvc.getDeliveryCost(restaurant.distance);
        });
        self.restaurants = this.sort(rs);
        self.loading = false;
      });
    } else {
      this.bHasAddress = false;
      this.merchantSvc.find(query).pipe(takeUntil(self.onDestroy$)).subscribe((rs: IMerchant[]) => {
        // const markers = []; // markers on map
        rs.map((restaurant: IMerchant) => {
          if (environment.language === 'en') {
            restaurant.name = restaurant.nameEN;
          }
          restaurant.inRange = true; // for display order deadline wording
          restaurant.distance = 0; // restaurant.distance / 1000;
          restaurant.fullDeliveryFee = self.distanceSvc.getDeliveryCost(restaurant.distance);
          restaurant.deliveryCost = self.distanceSvc.getDeliveryCost(restaurant.distance);
          restaurant.isClosed = false;
        });
        // self.markers = markers;
        self.restaurants = this.sort(rs);
        self.loading = false;
      });
    }
  }

  getImageSrc(restaurant: any) {
    if (restaurant.pictures && restaurant.pictures[0] && restaurant.pictures[0].url) {
      return environment.MEDIA_URL + restaurant.pictures[0].url;
    } else {
      return this.defaultPicture;
    }
  }


  toDetail(r: IMerchant) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: { name: 'restaurants' }
    });
    this.rx.dispatch({ type: RestaurantActions.UPDATE, payload: r });
    this.rx.dispatch({
      type: DeliveryActions.UPDATE_DESTINATION,
      payload: { destination: r.location, distance: r.distance }
    });

    this.rx.dispatch({
      type: CartActions.UPDATE_DELIVERY,
      payload: {
        merchantId: r._id,
        merchantName: r.name,
        deliveryCost: r.deliveryCost,
        deliveryDiscount: r.fullDeliveryFee
      }
    });
    this.router.navigate(['merchant/list/' + r._id + '/' + r.onSchedule]);
  }


  getDistanceString(r: IMerchant) {
    return r.distance.toFixed(2) + ' km';
  }

  sort(restaurants) {
    return restaurants.sort((a: IMerchant, b: IMerchant) => {
      if (!a.isClosed && b.isClosed) {
        return -1;
      } else if (a.isClosed && !b.isClosed) {
        return 1;
      } else if (a.onSchedule && !b.onSchedule) {
        return -1;
      } else if (!a.onSchedule && b.onSchedule) {
        return 1;
      } else if (!a.orderEnded && b.orderEnded) {
        return -1;
      } else if (a.orderEnded && !b.orderEnded) {
        return 1;
      } else if (a.inRange && !b.inRange) {
        return -1;
      } else if (!a.inRange && b.inRange) {
        return 1;
      } else {
        if (a.order && !b.order) {
          return -1;
        } else if (!a.order && b.order) {
          return 1;
        } else if (a.order && b.order) {
          if (a.order > b.order) {
            return 1;
          } else {
            return -1;
          }
        } else {
          if (a.distance < b.distance) {
            return -1;
          }
          if (a.distance > b.distance) {
            return 1;
          }
        }

        return 0;
      }
    });
  }

  isCloseInTurn(r: IMerchant) {
    return (this.bHasAddress && !r.onSchedule) || r.isClosed;
  }
}
