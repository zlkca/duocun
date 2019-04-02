import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { Restaurant, IRestaurant } from '../../restaurant/restaurant.model';
import { ILocation, ILatLng } from '../../location/location.model';
import { AuthService } from '../../account/auth.service';
import { LocationService } from '../../location/location.service';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { MallActions } from '../../mall/mall.actions';
import { IDeliverTimeAction } from '../../main/main.reducers';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { IMall } from '../../mall/mall.model';
import { PageActions } from '../../main/main.actions';

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

  malls: IMall[] = [
    {
      id: '1', name: 'Richmond Hill', type: 'real', lat: 43.8461479, lng: -79.37935279999999, radius: 8,
      workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '2', name: 'Arora', type: 'virtual', lat: 43.995042, lng: -79.442369, radius: 8,
      workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '3', name: 'Markham', type: 'virtual', lat: 43.867055, lng: -79.284616, radius: 8,
      workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '4', name: 'Richmond Hill', type: 'virtual', lat: 43.884244, lng: -79.467925, radius: 8,
      workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    }
  ];

  private onDestroy$ = new Subject<void>();
  constructor(
    private authSvc: AuthService,
    private locationSvc: LocationService,
    private restaurantSvc: RestaurantService,
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
        self.calcDistancesToMalls({ lat: location.lat, lng: location.lng });
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  calcDistancesToMalls(center: ILatLng) {
    const self = this;
    this.locationSvc.getRoadDistances(center, this.malls).subscribe(rs => {
      if (rs) {
        const reallDistances = rs.filter(r => r.type === 'real');
        self.malls.map((mall: IMall) => {
          const d = reallDistances.find(rm => rm.id === mall.id);
          if (d) {
            mall.distance = d.distance.value / 1000;
            mall.fullDeliverFee = self.getFullDeliveryFee(mall.distance);
            if (self.deliverTimeType === 'immediate') {
              mall.deliverFee = self.getDeliveryFee(mall.distance);
            } else {
              mall.deliverFee = 0;
            }
          }
        });

        self.rx.dispatch({
          type: MallActions.UPDATE,
          payload: self.malls.filter(r => r.type === 'real')
        });

        self.loadRestaurants();
      }
    });
  }

  loadRestaurants() {
    const self = this;
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
        // fix me
        restaurant.distance = self.malls[0].distance;
        restaurant.fullDeliveryFee = self.malls[0].fullDeliverFee;
        restaurant.deliveryFee = self.malls[0].deliverFee;
      });
      self.places = a;
    },
      (err: any) => {
        self.restaurants = [];
      }
    );
  }

  getFullDeliveryFee(distance: number) {
    if (distance <= 3) {
      return 5;
    } else {
      return 5 + 1.5 * Math.ceil(distance - 3);
    }
  }

  getDeliveryFee(distance: number) {
    if (distance <= 3) {
      return 3;
    } else {
      return 3 + 1.5 * Math.ceil(distance - 3);
    }
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

    this.loadRestaurants();
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
