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
  malls: IMall[] = [
    {
      id: '1', name: 'Richmond Hill', type: 'real', lat: 43.8461479, lng: -79.37935279999999, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '2', name: 'Arora', type: 'virtual', lat: 43.995042, lng: -79.442369, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '3', name: 'Markham', type: 'virtual', lat: 43.867055, lng: -79.284616, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '4', name: 'Richmond Hill', type: 'virtual', lat: 43.884244, lng: -79.467925, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    }
  ];
  private onDestroy$ = new Subject<void>();
  constructor(
    private restaurantSvc: RestaurantService,
    private distanceSvc: DistanceService,
    private locationSvc: LocationService,
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

        self.distanceSvc.find({where: {originPlaceId: location.placeId}}).pipe(
          takeUntil(self.onDestroy$)
        ).subscribe((ds: IDistance[]) => {
          if (ds && ds.length > 0) {
            const distance = self.updateMallInfo(ds);
            self.loadRestaurants(distance);
          } else {
            const destinations: ILocation[] = [];
            self.malls.filter(r => r.type === 'real').map(m => {
              destinations.push({lat: m.lat, lng: m.lng, placeId: m.placeId});
            });
            self.locationSvc.reqRoadDistances(location, destinations).pipe(
              takeUntil(this.onDestroy$)
            ).subscribe((rs: IDistance[]) => {
              if (rs) {
                const distance = self.updateMallInfo(rs);
                self.loadRestaurants(distance);
              }
            }, err => {
              console.log(err);
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

  updateMallInfo(rs: IDistance[]) {
    const self = this;
    const reallDistances = rs; // .filter(r => r.type === 'real');
    self.malls.map((mall: IMall) => {
      const d = reallDistances.find(rm => rm.destination.lat === mall.lat && rm.destination.lng === mall.lng);
      if (d) {
        mall.distance = d.element.distance.value / 1000;
        mall.fullDeliverFee = self.distanceSvc.getFullDeliveryFee(mall.distance);
        mall.deliverFee = self.distanceSvc.getDeliveryFee(mall.distance, self.deliveryTime.type);
      }
    });
    self.rx.dispatch({
      type: MallActions.UPDATE,
      payload: self.malls.filter(r => r.type === 'real')
    });

    return self.malls.filter(r => r.type === 'real')[0].distance;
  }

  loadRestaurants(distance: number) {
    const self = this;
    const fullDeliveryFee = self.distanceSvc.getFullDeliveryFee(distance);
    const deliveryFee = self.distanceSvc.getFullDeliveryFee(distance);

    this.restaurantSvc.find().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((ps: IRestaurant[]) => {
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
