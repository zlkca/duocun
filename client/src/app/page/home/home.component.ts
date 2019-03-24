import { Component, OnInit } from '@angular/core';
import { Restaurant, GeoPoint } from '../../lb-sdk';
// import { LocationService } from '../../shared/location/location.service';
import { environment } from '../../../environments/environment';
import { RestaurantService } from '../../restaurant/restaurant.service';
// import { RestaurantGridComponent } from '../../restaurant/restaurant-grid/restaurant-grid.component';
import { SharedService } from '../../shared/shared.service';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import { ILocationHistory, IPlace, ILocation } from '../../location/location.model';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../page.actions';

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

  options;
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
    private sharedSvc: SharedService,
    private rx: NgRedux<IAppState>,
  ) { }

  ngOnInit() {
    const self = this;
    this.subscrAccount = this.accountSvc.getCurrent().subscribe(account => {
      self.account = account;
    });
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'home'
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

  private getLocation(p: IPlace): ILocation {
    const terms = p.terms;
    return {
      place_id: p.place_id ? p.place_id : '',
      city: terms && terms.length > 3 ? p.terms[2].value : '',
      lat: 0,
      lng: 0,
      postal_code: '',
      province: terms && terms.length > 3 ? p.terms[3].value : '',
      street_name: terms && terms.length > 3 ? p.terms[1].value : '',
      street_number: terms && terms.length > 3 ? p.terms[0].value : '',
      sub_locality: ''
    };
  }

  onAddressChange(e) {
    const self = this;
    this.bHideMap = true;
    this.options = [];
    this.locationSvc.reqPlaces(e.input).subscribe((ps: IPlace[]) => {
      for (const p of ps) {
        const loc: ILocation = this.getLocation(p);
        self.options.push({location: loc, type: 'suggest'}); // without lat lng
      }
    });
    // localStorage.setItem('location-' + APP, JSON.stringify(e.addr));
    // this.sharedSvc.emitMsg({name: 'OnUpdateAddress', addr: e.addr});
    this.mapFullScreen = false;
  }

  onAddressClear(e) {
    this.deliveryAddress = '';
    this.mapFullScreen = true;
    this.options = [];
    this.bHideMap = false;
  }

  onAddressInputFocus(e) {
    const self = this;
    this.bHideMap = true;
    this.options = [];
    if (this.account && this.account.id) {
      this.locationSvc.find({ where: { userId: this.account.id } }).subscribe((lhs: ILocationHistory[]) => {
        for (const lh of lhs) {
          lh.type = 'history';
        }
        self.options = lhs;
      });
    }
  }

  onSelectPlace(place: any) {
    const self = this;
    this.deliveryAddress = self.locationSvc.getAddrString(place.location); // set address text to input
    this.mapFullScreen = false;
    self.options = [];

    if (place.type === 'suggest') {
      this.locationSvc.reqLocationByAddress(this.deliveryAddress).then(r => {
        self.bHideMap = false;
        self.center = { lat: r.lat, lng: r.lng };
        localStorage.setItem('location-' + APP, JSON.stringify(self.deliveryAddress));
        this.bTimeOptions = true;
        self.doSearchRestaurants(self.center);
        if (self.account) {
          self.locationSvc.save({
            userId: self.account.id, type: 'history',
            placeId: r.place_id, location: r, created: new Date()
          }).subscribe(x => {
          });
        }
      });
    } else if (place.type === 'history') {
      self.bHideMap = false;
      const r = place.location;
      self.center = { lat: r.lat, lng: r.lng };
      self.doSearchRestaurants(self.center);
      localStorage.setItem('location-' + APP, JSON.stringify(place.location));
      this.bTimeOptions = true;
    }

  }

  showMap() {
    return !(this.options && this.options.length > 0);
  }

  getMapHeight() {
    return this.mapFullScreen ? '700px' : '220px';
  }

  useCurrentLocation() {
    const self = this;
    self.options = [];
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
        self.locationSvc.save({ userId: self.account.id, type: 'history',
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
