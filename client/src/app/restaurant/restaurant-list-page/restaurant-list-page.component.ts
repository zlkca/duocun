import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { Restaurant } from '../../restaurant/restaurant.model';
import { ILocation, ILatLng } from '../../location/location.model';
import { AuthService } from '../../account/auth.service';
import { LocationService } from '../../location/location.service';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { MallActions } from '../../mall/mall.actions';
import { IDeliverTimeAction } from '../../main/main.reducers';

@Component({
  selector: 'app-restaurant-list-page',
  templateUrl: './restaurant-list-page.component.html',
  styleUrls: ['./restaurant-list-page.component.scss']
})
export class RestaurantListPageComponent implements OnInit {

  private places;

  deliveryTime = '';
  restaurants;
  center;
  realMalls;
  deliveryAddress;
  deliverTimeType;

  malls = [
    {id: 1, name: 'Richmond Hill', type: 'real', lat: 43.8461479, lng: -79.37935279999999, radius: 8,
      workers: [{id: '5c9966b7fb86d40a4414eb79', username: 'worker'}]
    },
    {id: 2, name: 'Arora', type: 'virtual', lat: 43.995042, lng: -79.442369, radius: 8,
      workers: [{id: '', username: 'worker1'}]
    },
    {id: 3, name: 'Markham', type: 'virtual', lat: 43.867055, lng: -79.284616, radius: 8,
      workers: [{id: '', username: 'worker2'}]
    },
  ];

  constructor(
    private authSvc: AuthService,
    private locationSvc: LocationService,
    private restaurantSvc: RestaurantService,
    private rx: NgRedux<IAppState>
  ) {

  }

  ngOnInit() {
    const self = this;
    const location: ILocation = this.authSvc.getLocation();
    if (location) {
      // self.deliveryAddress = self.locationSvc.getAddrString(location);
      self.center = { lat: location.lat, lng: location.lng };
      // self.bHideMap = false;
      // self.mapFullScreen = false;
      // self.bTimeOptions = true;
      self.calcDistancesToMalls({ lat: location.lat, lng: location.lng });
    }


    this.rx.select<IDeliverTimeAction>('deliverTime').subscribe(
      deliverTime => {
        self.deliverTimeType = deliverTime;
      });

  }

  calcDistancesToMalls(center: ILatLng) {
    const self = this;
    this.locationSvc.getRoadDistances(center, this.malls).subscribe(rs => {
      if (rs) {
        self.realMalls = rs.filter(r => r.type === 'real');

        const mall = self.malls.find(x => x.id === self.realMalls[0].id);

        self.rx.dispatch({
          type: MallActions.UPDATE,
          payload: mall
        });

        self.loadRestaurants();
      }
    });
  }

  loadRestaurants() {
    const self = this;
    this.restaurantSvc.find().subscribe((ps: Restaurant[]) => {
        self.restaurants = ps; // self.toProductGrid(data);
        const a = [];
        const distance = self.realMalls[0].distance;
        ps.map(restaurant => {
          if (restaurant.location) {
            a.push({
              lat: restaurant.location.lat,
              lng: restaurant.location.lng,
              name: restaurant.name
            });
          }
          restaurant.distance = distance.value;
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
