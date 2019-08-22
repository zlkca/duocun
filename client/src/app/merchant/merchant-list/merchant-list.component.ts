import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { MerchantService } from '../merchant.service';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { environment } from '../../../environments/environment';
import { Router } from '../../../../node_modules/@angular/router';
import { Subject } from '../../../../node_modules/rxjs';
import * as moment from 'moment';
import { IMall } from '../../mall/mall.model';
import { MallService } from '../../mall/mall.service';
import { IDistance, ILocation } from '../../location/location.model';
import { DistanceService } from '../../location/distance.service';
import { IRange } from '../../range/range.model';
import { RangeService } from '../../range/range.service';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
import { RestaurantActions } from '../../restaurant/restaurant.actions';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { CartActions } from '../../cart/cart.actions';

@Component({
  selector: 'app-merchant-list',
  templateUrl: './merchant-list.component.html',
  styleUrls: ['./merchant-list.component.scss']
})
export class MerchantListComponent implements OnInit, OnDestroy, OnChanges {

  @Input() delivered; // moment date
  @Input() address; // ILocation
  @Input() active;

  onDestroy$ = new Subject();
  markers;
  restaurants;
  defaultPicture = window.location.protocol + '//placehold.it/400x300';
  malls;

  constructor(
    private merchantSvc: MerchantService,
    private distanceSvc: DistanceService,
    private mallSvc: MallService,
    private rangeSvc: RangeService,
    private router: Router,
    private rx: NgRedux<IAppState>
  ) {

  }

  ngOnChanges(d) {
    const self = this;
    // if (d.active && d.active.currentValue) {
    if (d.address) {
      const origin = d.address.currentValue;
      if (!origin) {
        return;
      }

      self.rangeSvc.find().pipe(takeUntil(self.onDestroy$)).subscribe(ranges => {
        const rs = self.rangeSvc.getAvailableRanges({ lat: origin.lat, lng: origin.lng }, ranges);
        // self.inRange = (rs && rs.length > 0) ? true : false;
        // self.availableRanges = rs;
        // this.loadRestaurants(this.malls, rs, null);

        const q = { originPlaceId: origin.placeId }; // origin --- client origin
        self.distanceSvc.find(q).pipe(takeUntil(self.onDestroy$)).subscribe((ds: IDistance[]) => {
          if (ds && ds.length > 0) {
            if (ds.length === self.malls.length) {
              self.loadRestaurants(this.malls, rs, ds);
            } else {
              this.updateDistancesAndLoadRestaurants(origin, this.malls, rs);
            }
          } else {
            this.updateDistancesAndLoadRestaurants(origin, this.malls, rs);
          }
        });
      });
    }

    if (d.delivered) {
      const clonedRestaurants = [];
      if (self.restaurants) {
        self.restaurants.map(r => {
          const item = Object.assign({}, r);
          item.isClosed = self.merchantSvc.isClosed(item, d.delivered.currentValue);
          clonedRestaurants.push(item);
        });
      }
      self.restaurants = self.sort(clonedRestaurants);
    }

    // } else {

    // }

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    // because distances cached inactive malls, so need all malls
    this.mallSvc.find().pipe(takeUntil(this.onDestroy$)).subscribe((malls: IMall[]) => {
      this.malls = malls;
      this.loadRestaurants(malls, null, null);
    });
  }

  loadRestaurants(malls, availableRanges, distances) { // load with distance
    const self = this;

    this.merchantSvc.find({ status: 'active' }).pipe(takeUntil(this.onDestroy$)).subscribe((rs: IRestaurant[]) => {
      const markers = []; // markers on map
      rs.map((restaurant: IRestaurant) => {
        if (restaurant.location) {
          markers.push({
            lat: restaurant.location.lat,
            lng: restaurant.location.lng,
            name: restaurant.name
          });
        }

        const mall = malls.find(m => m.id === restaurant.malls[0]); // fix me, get physical distance
        restaurant.inRange = availableRanges ? self.isInRange(mall, availableRanges) : true;
        const distance = distances ? self.getDistance(distances, mall) : 0;
        restaurant.distance = distance / 1000;
        restaurant.fullDeliveryFee = self.distanceSvc.getDeliveryCost(distance / 1000);
        restaurant.deliveryCost = self.distanceSvc.getDeliveryCost(distance / 1000);
        restaurant.isClosed = self.merchantSvc.isClosed(restaurant, self.delivered);
      });
      self.markers = markers;
      self.restaurants = this.sort(rs);
    }, (err: any) => {
      self.restaurants = [];
    }
    );
  }

  isInRange(mall: IMall, availableRanges: IRange[]) {
    let bInRange = false;
    if (mall.ranges) {
      mall.ranges.map((rangeId: string) => {
        const range = availableRanges.find(ar => ar.id === rangeId);
        if (range) {
          bInRange = true;
        }
      });
    }
    return bInRange;
  }

  getDistance(ds: IDistance[], mall: IMall) {
    const d = ds.find(r => r.destinationPlaceId === mall.placeId);
    return d ? d.element.distance.value : null;
  }

  // reload(availableRanges) {
  //   const self = this;
  //   const origin = this.address;
  //   if (origin) {
  //     // because distances cached inactive malls, so need all malls
  //     this.mallSvc.find().pipe(takeUntil(this.onDestroy$)).subscribe((malls: IMall[]) => {
  //       // this.realMalls = malls;
  //       // check if road distance in database
  //       const q = { originPlaceId: origin.placeId }; // origin --- client origin
  //       self.distanceSvc.find(q).pipe(takeUntil(self.onDestroy$)).subscribe((ds: IDistance[]) => {
  //         if (ds && ds.length > 0) {
  //           if (ds.length === malls.length) {
  //             self.loadRestaurants(malls, availableRanges, ds);
  //           } else {
  //             self.updateDistancesAndLoadRestaurants(origin, malls, availableRanges);
  //           }
  //         } else {
  //           self.updateDistancesAndLoadRestaurants(origin, malls, availableRanges);
  //         }
  //       });
  //       // self.loadRestaurants(ms);
  //     });
  //   } else {

  //   }
  // }

  isNotOpening(restaurant: IRestaurant) {
    const m = moment(this.delivered.toDate());
    if (moment().isSame(m, 'day')) {
      return this.merchantSvc.isNotOpening(restaurant);
    } else {
      return false;
    }
  }

  getImageSrc(restaurant: any) {
    if (restaurant.pictures && restaurant.pictures[0] && restaurant.pictures[0].url) {
      return environment.MEDIA_URL + restaurant.pictures[0].url;
    } else {
      return this.defaultPicture;
    }
  }

  toDetail(r: IRestaurant) {
    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: 'restaurants' });
    this.rx.dispatch({ type: RestaurantActions.UPDATE, payload: r });
    this.rx.dispatch({
      type: DeliveryActions.UPDATE_DESTINATION,
      payload: { destination: r.location, distance: r.distance }
    });

    this.rx.dispatch({
      type: CartActions.UPDATE_DELIVERY,
      payload: {
        merchantId: r.id,
        merchantName: r.name,
        deliveryCost: r.deliveryCost,
        deliveryDiscount: r.fullDeliveryFee
      }
    });
    this.router.navigate(['merchant/list/' + r.id]);
  }

  getFilter(query?: any) {
    const qs = [];
    if (query.categories && query.categories.length > 0) {
      const s = query.categories.join(',');
      qs.push('cats=' + s);
    }
    return qs;
  }

  getDistanceString(r: IRestaurant) {
    return r.distance.toFixed(2) + ' km';
  }

  updateDistancesAndLoadRestaurants(origin, malls, ranges) {
    const self = this;
    const destinations: ILocation[] = [];
    malls.map(m => {
      destinations.push({ lat: m.lat, lng: m.lng, placeId: m.placeId });
    });
    this.distanceSvc.reqRoadDistances(origin, destinations).pipe(takeUntil(this.onDestroy$)).subscribe((ks: IDistance[]) => {
      if (ks) {
        // const ms = self.updateMallInfo(rs, malls);
        self.loadRestaurants(malls, ranges, ks);
      }
    }, err => {
      console.log(err);
    });
  }

  sort(restaurants) {
    return restaurants.sort((a: IRestaurant, b: IRestaurant) => {
      if (!a.isClosed && b.isClosed) {
        return -1;
      } else if (a.isClosed && !b.isClosed) {
        return 1;
      } else if (!this.isNotOpening(a) && this.isNotOpening(b)) {
        return -1;
      } else if (this.isNotOpening(a) && !this.isNotOpening(b)) {
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
}
