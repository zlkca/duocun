import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { Restaurant, IRestaurant } from '../../restaurant/restaurant.model';
import { ILocation, ILatLng, IDistance } from '../../location/location.model';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { MallActions } from '../../mall/mall.actions';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { IMall } from '../../mall/mall.model';
import { PageActions } from '../../main/main.actions';
import { MallService } from '../../mall/mall.service';
import { DistanceService } from '../../location/distance.service';

@Component({
  selector: 'app-restaurant-list-page',
  templateUrl: './restaurant-list-page.component.html',
  styleUrls: ['./restaurant-list-page.component.scss']
})
export class RestaurantListPageComponent implements OnInit, OnDestroy {
  private places;
  location;
  deliveryTime = '';
  restaurants: IRestaurant[];
  center;
  realMalls;
  deliveryAddress;
  deliverTimeType = 'immediate';

  malls: IMall[];

  private onDestroy$ = new Subject<void>();
  constructor(
    private restaurantSvc: RestaurantService,
    private distanceSvc: DistanceService,
    private mallSvc: MallService,
    private rx: NgRedux<IAppState>,
  ) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'restaurant-list'
    });
  }

  ngOnInit() {
    const self = this;
    forkJoin([
      this.rx.select<string>('deliverTime').pipe(
        first(),
        takeUntil(this.onDestroy$)
      ),
      this.rx.select<ILocation>('location').pipe(
        first(),
        takeUntil(this.onDestroy$)
      )
    ]).subscribe(vals => {
      const location = vals[1];
      self.deliverTimeType = vals[0];
      if (location) {
        self.center = { lat: location.lat, lng: location.lng };

        self.distanceSvc.find({where: {originPlaceId: location.placeId}}).pipe(
          takeUntil(self.onDestroy$)
        ).subscribe((ds: IDistance[]) => {
          if (ds && ds.length > 0) {
            // fix me load malls
            const distance = ds[0].element.distance.value / 1000;
            const fullDeliveryFee = self.distanceSvc.getFullDeliveryFee(distance);
            const deliveryFee = self.distanceSvc.getFullDeliveryFee(distance);
            self.rx.dispatch({
              type: MallActions.UPDATE,
              payload: [{
                distance: distance,
                deliverFee: deliveryFee,
                fullDeliverFee: fullDeliveryFee
              }]
            });
            self.loadRestaurants(ds[0].element.distance.value / 1000);
          } else {
            self.mallSvc.calcMalls(location, self.deliverTimeType).then((malls: IMall[]) => {
              self.malls = malls;
              self.rx.dispatch({
                type: MallActions.UPDATE,
                payload: self.malls.filter(r => r.type === 'real')
              });
              self.loadRestaurants(malls[0].distance);
            });
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  loadRestaurants(distance: number) {
    const self = this;
    const fullDeliveryFee = self.distanceSvc.getFullDeliveryFee(distance);
    const deliveryFee = self.distanceSvc.getFullDeliveryFee(distance);

    this.restaurantSvc.find().subscribe((ps: IRestaurant[]) => {
      self.restaurants = ps; // self.toProductGrid(data);
      const a = [];
      ps.map(restaurant => {
        if (restaurant.location) {
          a.push({
            lat: restaurant.location.lat,
            lng: restaurant.location.lng,
            name: restaurant.name
          });
        }
        // fix me !!!
        restaurant.distance = distance;
        restaurant.fullDeliveryFee = fullDeliveryFee;
        restaurant.deliveryFee = deliveryFee;
      });
      self.places = a;
    },
      (err: any) => {
        self.restaurants = [];
      }
    );
  }

  getFilter(query?: any) {
    const qs = [];

    if (query.categories && query.categories.length > 0) {
      const s = query.categories.join(',');
      qs.push('cats=' + s);
    }

    // if(query.restaurants && query.restaurants.length>0){
    //   let s = query.restaurants.join(',');
    //   qs.push('ms=' + s);
    // }

    // if(query.colors && query.colors.length>0){
    //   let s = query.colors.join(',');
    //   qs.push('colors=' + s);
    // }
    return qs;
  }

  doSearchRestaurants(query?: any) {
    // query --- eg. {}
    const self = this;
    const qs = self.getFilter(query);
    let s = '';
    const conditions = [];

    if (qs.length > 0) {
      conditions.push(qs.join('&'));
    }
    if (query && query.keyword) {
      conditions.push('keyword=' + query.keyword);
    }
    if (query && query.lat && query.lng) {
      conditions.push('lat=' + query.lat + '&lng=' + query.lng);
    }

    if (conditions.length > 0) {
      s = '?' + conditions.join('&');
    }

    // this.loadRestaurants();
  }


  loadNearbyRestaurants(center) {
    // const self = this;
    // this.restaurantSvc.getNearby(center).subscribe(
    //   (ps: Restaurant[]) => {
    //     self.restaurants = ps; // self.toProductGrid(data);
    //     const a = [];
    //     ps.map(restaurant => {
    //       if (restaurant.location) {
    //         a.push({
    //           lat: restaurant.location.lat,
    //           lng: restaurant.location.lng,
    //           name: restaurant.name
    //         });
    //       }
    //     });
    //     self.places = a;
    //   },
    //   (err: any) => {
    //     self.restaurants = [];
    //   }
    // );
  }

  search() {
    // const self = this;
    // const s = localStorage.getItem('location-' + APP);

    // if (s) {
    //   const location = JSON.parse(s);
    //   self.deliveryAddress = self.locationSvc.getAddrString(location);
    //   this.center = { lat: location.lat, lng: location.lng };
    //   self.loadNearbyRestaurants(this.center);
    // } else {
    //   this.locationSvc.getCurrentLocation().subscribe(r => {
    //     localStorage.setItem('location-' + APP, JSON.stringify(r));
    //     self.loadNearbyRestaurants(self.center);
    //   },
    //   err => {
    //     console.log(err);
    //     // alert('Do you want to turn on your GPS to find the nearest restaurants?');
    //   });
    // }
  }

  toDetail() {

  }
}
