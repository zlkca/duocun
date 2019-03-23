import { Component, OnInit } from '@angular/core';
import { Restaurant, GeoPoint } from '../../lb-sdk';
// import { LocationService } from '../../shared/location/location.service';
import { environment } from '../../../environments/environment';
import { RestaurantService } from '../../restaurant/restaurant.service';
// import { RestaurantGridComponent } from '../../restaurant/restaurant-grid/restaurant-grid.component';
import { SharedService } from '../../shared/shared.service';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import { ILocationHistory } from '../../location/location.model';

declare var google;

const APP = environment.APP;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  center: GeoPoint = { lat: 43.761539, lng: -79.411079 };
  restaurants;
  places;
  suggestPlaces;
  historyPlaces;
  deliveryAddress = '';
  placeholder = 'Delivery Address';
  mapFullScreen = true;
  subscrAccount;
  account;
  bHideMap = false;
  bTimeOptions = false;

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private restaurantSvc: RestaurantService,
    private sharedSvc: SharedService
  ) { }

  ngOnInit() {
    const self = this;
    this.subscrAccount = this.accountSvc.getCurrent().subscribe(account => {
      self.account = account;
    });
    // const s = localStorage.getItem('location-' + APP);

    // if (s) {
    //   const location = JSON.parse(s);
    //   self.deliveryAddress = self.locationSvc.getAddrString(location);
    //   self.center = { lat: location.lat, lng: location.lng };
    //   self.doSearchRestaurants(self.center);
    // } else {
    //   this.locationSvc.getCurrentLocation().subscribe(r => {
    //     self.center = { lat: r.lat, lng: r.lng };
    //     self.doSearchRestaurants(self.center);
    //   });
    // }
  }

  toDetail() {

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

  loadRestaurants() {
    const self = this;
    // this.restaurantServ.getNearby(this.center).subscribe(
    this.restaurantSvc.find().subscribe(
      (ps: Restaurant[]) => {
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
        });
        self.places = a;
      },
      (err: any) => {
        self.restaurants = [];
      }
    );
  }

  loadNearbyRestaurants(center) {
    const self = this;
    this.restaurantSvc.getNearby(center).subscribe(
      (ps: Restaurant[]) => {
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
        });
        self.places = a;
      },
      (err: any) => {
        self.restaurants = [];
      }
    );
  }

  search() {
    const self = this;
    const s = localStorage.getItem('location-' + APP);

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

  onAddressChange(e) {
    const self = this;
    this.bHideMap = true;
    this.historyPlaces = [];
    this.locationSvc.reqPlaces(e.input).subscribe(x => {
      self.suggestPlaces = x; // without lat lng
    });
    // localStorage.setItem('location-' + APP, JSON.stringify(e.addr));
    // this.sharedSvc.emitMsg({name: 'OnUpdateAddress', addr: e.addr});
    this.mapFullScreen = false;
  }

  onAddressClear(e) {
    this.deliveryAddress = '';
    this.mapFullScreen = true;
    this.historyPlaces = [];
    this.suggestPlaces = [];
    this.bHideMap = false;
  }

  onAddressInputFocus(e) {
    const self = this;
    this.bHideMap = true;
    this.suggestPlaces = [];
    if (this.account && this.account.id) {
      this.locationSvc.find({where: { userId: this.account.id }}).subscribe(x => {
        self.historyPlaces = x;
      });
    }
  }

  onSelectPlaceHistory(history: ILocationHistory) {
    const self = this;
    this.deliveryAddress = this.locationSvc.getAddrString(history.location);
    this.mapFullScreen = false;
    self.historyPlaces = [];
    self.bHideMap = false;
    const r = history.location;
    self.center = { lat: r.lat, lng: r.lng };
    self.doSearchRestaurants(self.center);
    localStorage.setItem('location-' + APP, JSON.stringify(history.location));
    this.bTimeOptions = true;
  }

  onSelectPlace(place) {
    const self = this;
    this.mapFullScreen = false;
    self.suggestPlaces = [];

    const addr = self.locationSvc.getAddrStringByPlace(place); // set address text to input
    this.deliveryAddress = addr;
    this.locationSvc.reqLocationByAddress(addr).then(r => {
      self.bHideMap = false;
      self.center = { lat: r.lat, lng: r.lng };
      localStorage.setItem('location-' + APP, JSON.stringify(addr));
      this.bTimeOptions = true;
      self.doSearchRestaurants(self.center);
      if (self.account) {
          self.locationSvc.save({ userId: self.account.id, placeId: r.place_id, location: r, created: new Date()}).subscribe(x => {
          });
      }
    });
  }

  showMap() {
    return !((this.suggestPlaces && this.suggestPlaces.length > 0) || (this.historyPlaces && this.historyPlaces.length > 0));
  }

  getMapHeight() {
    return this.mapFullScreen ? '700px' : '220px';
  }

  useCurrentLocation() {
    const self = this;
    self.suggestPlaces = [];
    self.historyPlaces = [];
    this.locationSvc.getCurrentLocation().then(r => {
      self.bHideMap = false;
      self.mapFullScreen = false;
      self.sharedSvc.emitMsg({name: 'OnUpdateAddress', addr: r});
      // self.loadNearbyRestaurants(self.center);
      localStorage.setItem('location-' + APP, JSON.stringify(r));
      self.deliveryAddress = self.locationSvc.getAddrString(r); // set address text to input
      self.center = { lat: r.lat, lng: r.lng };
      self.doSearchRestaurants(self.center);

      if (self.account) {
        self.locationSvc.save({ userId: self.account.id,
          placeId: r.place_id, location: r, created: new Date() }).subscribe(x => {
        });
      }
    },
    err => {
      console.log(err);
    });
  }

  setWorkAddr() {
    const self = this;
    // this.locationSvc.getCurrentLocation().subscribe(r => {
    //   self.sharedSvc.emitMsg({name: 'OnUpdateAddress', addr: r});
    //   self.setAddrString(r);
    //   self.loadNearbyRestaurants(self.center);
    // },
    // err => {
    //   console.log(err);
    //   // alert('Do you want to turn on your GPS to find the nearest restaurants?');
    // });
  }

  onSelectTime() {
    this.bHideMap = true;
    this.bTimeOptions = false;
  }
}
