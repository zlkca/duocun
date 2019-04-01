import { Component, OnInit } from '@angular/core';
import { GeoPoint } from '../../lb-sdk';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/shared.service';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import { ILocationHistory, IPlace, ILocation, ILatLng } from '../../location/location.model';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
import { MallActions } from '../../mall/mall.actions';
import { SocketService } from '../../shared/socket.service';
import { Router } from '@angular/router';
import { AuthService } from '../../account/auth.service';
import { DeliverTimeActions } from '../main.actions';
import { IDeliverTimeAction } from '../main.reducers';

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
  today;
  tomorrow;
  dayAfterTomorrow;
  lunchTime = {start: '11:45', end: '13:45'};
  overdue;
  afternoon;
  deliveryDiscount = 2;
  deliveryTime = 'immediate';
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
  realMalls = [];
  inRange = false;

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private sharedSvc: SharedService,
    private authSvc: AuthService,
    private socketSvc: SocketService,
    private route: Router,
    private rx: NgRedux<IAppState>
  ) {
    this.today = sharedSvc.getTodayString();
    this.tomorrow = sharedSvc.getNextNDayString(1);
    this.dayAfterTomorrow = sharedSvc.getNextNDayString(2);
    this.overdue = sharedSvc.isOverdue(9);
    this.afternoon = sharedSvc.isOverdue(13, 45);
  }

  ngOnInit() {
    const self = this;
    this.subscrAccount = this.accountSvc.getCurrent().subscribe(account => {
      self.account = account;

      self.socketSvc.init(this.authSvc.getAccessToken());

    });
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'home'
    });

    const location: ILocation = this.authSvc.getLocation();
    if (location) {
      self.deliveryAddress = self.locationSvc.getAddrString(location);
      self.center = { lat: location.lat, lng: location.lng };
      self.bHideMap = false;
      self.mapFullScreen = false;
      self.bTimeOptions = true;
      self.calcDistancesToMalls({ lat: location.lat, lng: location.lng });
    }
    // } else {
    //   this.locationSvc.getCurrentLocation().subscribe(r => {
    //     self.center = { lat: r.lat, lng: r.lng };
    //     self.doSearchRestaurants(self.center);
    //   });
    // }
  }

  setupSocket() {

  }

  calcDistancesToMalls(center: ILatLng) {
    const self = this;
    let inRange = false;
    this.malls.map(mall => {
      if (self.locationSvc.getDirectDistance(center, mall) < 8000) {
        inRange = true;
      }
    });
    this.inRange = inRange;
    // this.locationSvc.getRoadDistances(center, this.malls).subscribe(rs => {
    //   if (rs) {
    //     self.realMalls = rs.filter(r => r.type === 'real');

    //     const mall = self.malls.find(x => x.id === self.realMalls[0].id);

    //     self.rx.dispatch({
    //       type: MallActions.UPDATE,
    //       payload: mall
    //     });
    //   }
    // });
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
    this.bTimeOptions = false;
    this.options = [];
    this.locationSvc.reqPlaces(e.input).subscribe((ps: IPlace[]) => {
      if (ps && ps.length > 0) {
        for (const p of ps) {
          const loc: ILocation = this.getLocation(p);
          self.options.push({ location: loc, type: 'suggest' }); // without lat lng
        }
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
    this.authSvc.removeLocation();
  }

  onAddressInputFocus(e) {
    const self = this;
    this.bHideMap = true;
    this.bTimeOptions = false;
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

  onSelectPlace(e) {
    const r = e.location;
    this.options = [];
    if (r) {
      this.authSvc.setLocation(r);
      this.bHideMap = false;
      this.center = { lat: r.lat, lng: r.lng };
      this.bTimeOptions = true;
      this.calcDistancesToMalls({ lat: r.lat, lng: r.lng });
      this.deliveryAddress = e.address; // set address text to input
      this.mapFullScreen = false;
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
      self.bTimeOptions = true;
      self.sharedSvc.emitMsg({name: 'OnUpdateAddress', addr: r});
      // self.loadNearbyRestaurants(self.center);
      // localStorage.setItem('location-' + APP, JSON.stringify(r));
      self.deliveryAddress = self.locationSvc.getAddrString(r); // set address text to input
      self.center = { lat: r.lat, lng: r.lng };
      self.calcDistancesToMalls({ lat: r.lat, lng: r.lng });
      self.authSvc.setLocation(r);

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

  onSelectTime(type: string) {
    this.bHideMap = true;
    this.bTimeOptions = false;
    this.options = [];
    this.deliveryTime = type;
    this.rx.dispatch<IDeliverTimeAction>({
      type: DeliverTimeActions.UPDATE,
      payload: type
    });
    this.route.navigate(['restaurant/list']);
  }
}
