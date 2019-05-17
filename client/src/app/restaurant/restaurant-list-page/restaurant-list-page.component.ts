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
import { DistanceService } from '../../location/distance.service';
import { LocationService } from '../../location/location.service';
import { IDeliveryTime, IDelivery } from '../../delivery/delivery.model';
import { MallService } from '../../mall/mall.service';
import { IRange } from '../../range/range.model';
import { DeliveryActions } from '../../delivery/delivery.actions';

@Component({
  selector: 'app-restaurant-list-page',
  templateUrl: './restaurant-list-page.component.html',
  styleUrls: ['./restaurant-list-page.component.scss']
})
export class RestaurantListPageComponent implements OnInit, OnDestroy {
  private places;
  location;
  deliveryTime;
  restaurants: IRestaurant[];
  center;
  realMalls;
  deliveryAddress;
  delivery;

  // malls: IMall[];
  // malls: IMall[] = [
  //   {
  //     id: '1', name: 'Richmond Hill', type: 'real', lat: 43.8461479, lng: -79.37935279999999, radius: 8,
  //     placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
  //   },
  //   {
  //     id: '2', name: 'Arora', type: 'virtual', lat: 43.995042, lng: -79.442369, radius: 8,
  //     placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
  //   },
  //   {
  //     id: '3', name: 'Markham', type: 'virtual', lat: 43.867055, lng: -79.284616, radius: 8,
  //     placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
  //   },
  //   {
  //     id: '4', name: 'Richmond Hill', type: 'virtual', lat: 43.884244, lng: -79.467925, radius: 8,
  //     placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
  //   }
  // ];
  private onDestroy$ = new Subject<void>();
  constructor(
    private restaurantSvc: RestaurantService,
    private distanceSvc: DistanceService,
    private locationSvc: LocationService,
    private mallSvc: MallService,
    private rx: NgRedux<IAppState>,
  ) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'restaurant-list'
    });
  }

  getNewMalls(ds, malls) {
    const ms = [];
    for (let i = 0; i < ds.length; i++) {
      for (let j = 0; j < malls.length; j++) {
        const rm = ds[i];
        const mall = malls[j];
        if (rm.destination.lat !== +mall.lat && rm.destination.lng !== +mall.lng) {
          ms.push({ lat: mall.lat, lng: mall.lng, placeId: mall.placeId });
        }
      }
    }
    return ms;
  }

  ngOnInit() {
    const self = this;

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((d: IDelivery) => {
      self.deliveryTime = { from: d.fromTime, to: d.toTime };
      const location = d.origin;
      const availableRanges: IRange[] = d.availableRanges;

      if (location) {
        self.center = { lat: location.lat, lng: location.lng };
        self.mallSvc.find().pipe(takeUntil(this.onDestroy$)).subscribe((malls: IMall[]) => {
          // check if road distance in database
          self.distanceSvc.find({ where: { originPlaceId: location.placeId } }).pipe(
            takeUntil(self.onDestroy$)
          ).subscribe((ds: IDistance[]) => {
            if (ds && ds.length > 0) {
              self.loadRestaurants(malls, availableRanges, ds);
            } else {
              const destinations: ILocation[] = [];
              malls.map(m => {
                destinations.push({ lat: m.lat, lng: m.lng, placeId: m.placeId });
              });
              self.distanceSvc.reqRoadDistances(location, destinations).pipe(
                takeUntil(this.onDestroy$)
              ).subscribe((rs: IDistance[]) => {
                if (rs) {
                  // const ms = self.updateMallInfo(rs, malls);
                  self.loadRestaurants(malls, availableRanges, rs);
                }
              }, err => {
                console.log(err);
              });
            }
          });
          // self.loadRestaurants(ms);
        });
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  // return meter or null
  getDistance(ds: IDistance[], mall: IMall) {
    const d = ds.find(r => r.destinationPlaceId === mall.placeId);
    return d ? d.element.distance.value : null;
  }

  // deprecated
  updateMallInfo(rs: IDistance[], malls: IMall[]) {

  }

  loadRestaurants(malls: IMall[], availableRanges: IRange[], distances: IDistance[]) { // load with distance
    const self = this;

    this.restaurantSvc.find().pipe(takeUntil(this.onDestroy$)).subscribe((rs: IRestaurant[]) => {
      const a = []; // for display marks on map
      rs.map((restaurant: IRestaurant) => {
        if (restaurant.location) {
          a.push({
            lat: restaurant.location.lat,
            lng: restaurant.location.lng,
            name: restaurant.name
          });
        }

        const mall = malls.find(m => m.id === restaurant.malls[0]); // fix me, get physical distance
        restaurant.inRange = self.isInRange(mall, availableRanges);
        const distance = self.getDistance(distances, mall);
        restaurant.distance = distance / 1000;
        restaurant.fullDeliveryFee = self.distanceSvc.getDeliveryCost(distance / 1000);
        restaurant.deliveryFee = self.distanceSvc.getDeliveryFee(distance / 1000, self.deliveryTime);
        restaurant.isClosed = self.restaurantSvc.isClosed(restaurant, self.deliveryTime);
      });
      self.places = a;
      self.restaurants = rs;
    }, (err: any) => {
        self.restaurants = [];
      }
    );
  }

  isInRange(mall: IMall, availableRanges: IRange[]) {
    let bInRange = false;
    mall.ranges.map((rangeId: string) => {
      const range = availableRanges.find(ar => ar.id === rangeId);
      if (range) {
        bInRange = true;
      }
    });
    return bInRange;
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
  }


  loadNearbyRestaurants(center) {

  }

  search() {

  }

  toDetail() {

  }
}
