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
import { IDeliveryTime } from '../../delivery/delivery.model';
import { MallService } from '../../mall/mall.service';

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
    forkJoin([
      this.rx.select<string>('deliveryTime').pipe(
        first(),
        takeUntil(this.onDestroy$)
      ),
      this.rx.select<ILocation>('location').pipe(
        first(),
        takeUntil(this.onDestroy$)
      )
    ]).subscribe(vals => {
      const location = vals[1];
      self.deliveryTime = vals[0];
      if (location) {
        self.center = { lat: location.lat, lng: location.lng };

        self.mallSvc.find().pipe(takeUntil(this.onDestroy$)).subscribe((malls: IMall[]) => {
          // check if road distance in database
          self.distanceSvc.find({ where: { originPlaceId: location.placeId } }).pipe(
            takeUntil(self.onDestroy$)
          ).subscribe((ds: IDistance[]) => {
            if (ds && ds.length > 0) {
              // const newDestinations = self.getNewMalls(ds, malls);
              // if (newDestinations && newDestinations.length > 0) {
              //   self.locationSvc.reqRoadDistances(location, newDestinations).pipe(
              //     takeUntil(this.onDestroy$)
              //   ).subscribe((ns: IDistance[]) => {
              //     const ms = self.updateMallInfo(ds.concat(ns), malls);
              //     self.loadRestaurants(ms);
              //   });
              // } else {
                const ms = self.updateMallInfo(ds, malls);
                self.loadRestaurants(ms);
              // }
            } else {
              const destinations: ILocation[] = [];
              malls.map(m => {
                destinations.push({ lat: m.lat, lng: m.lng, placeId: m.placeId });
              });
              self.locationSvc.reqRoadDistances(location, destinations).pipe(
                takeUntil(this.onDestroy$)
              ).subscribe((rs: IDistance[]) => {
                if (rs) {
                  const ms = self.updateMallInfo(rs, malls);
                  self.loadRestaurants(ms);
                }
              }, err => {
                console.log(err);
              });
            }
          });
          // self.loadRestaurants(ms);
        });

        // self.distanceSvc.find({where: {originPlaceId: location.placeId}}).pipe(
        //   takeUntil(self.onDestroy$)
        // ).subscribe((ds: IDistance[]) => {
        //   if (ds && ds.length > 0) {
        //     const distance = self.updateMallInfo(ds);
        //     self.loadRestaurants(distance);
        //   } else {
        //     const destinations: ILocation[] = [];
        //     self.malls.filter(r => r.type === 'real').map(m => {
        //       destinations.push({lat: m.lat, lng: m.lng, placeId: m.placeId});
        //     });
        //     self.locationSvc.reqRoadDistances(location, destinations).pipe(
        //       takeUntil(this.onDestroy$)
        //     ).subscribe((rs: IDistance[]) => {
        //       if (rs) {
        //         const distance = self.updateMallInfo(rs);
        //         self.loadRestaurants(distance);
        //       }
        //     }, err => {
        //       console.log(err);
        //     });
        //   }
        // });
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  updateMallInfo(rs: IDistance[], malls: IMall[]) {
    const self = this;
    malls.map((mall: IMall) => {
      // const d = rs.find(rm => rm.destination.lat === +mall.lat && rm.destination.lng === +mall.lng);
      const d = rs.find(r => r.destinationPlaceId === mall.placeId);
      if (d) {
        mall.distance = d.element.distance.value / 1000;
        mall.fullDeliverFee = self.distanceSvc.getDeliveryCost(mall.distance);
        mall.deliverFee = self.distanceSvc.getDeliveryFee(mall.distance, self.deliveryTime);
      }
    });
    self.rx.dispatch({ type: MallActions.UPDATE, payload: malls });
    self.realMalls = malls;
    return malls;
  }

  loadRestaurants(malls: IMall[]) { // load with distance
    const self = this;
    this.restaurantSvc.find().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((rs: IRestaurant[]) => {
      self.restaurants = rs; // self.toProductGrid(data);
      const a = []; // for display marks on map
      rs.map(restaurant => {
        if (restaurant.location) {
          a.push({
            lat: restaurant.location.lat,
            lng: restaurant.location.lng,
            name: restaurant.name
          });
        }

        const mall = malls.find(m => m.id === restaurant.mallId);
        restaurant.distance = mall.distance;
        restaurant.fullDeliveryFee = self.distanceSvc.getDeliveryCost(mall.distance);
        restaurant.deliveryFee = self.distanceSvc.getDeliveryFee(mall.distance, self.deliveryTime);
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
