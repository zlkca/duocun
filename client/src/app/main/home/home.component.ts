import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/shared.service';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import { ILocationHistory, IPlace, ILocation, ILatLng, GeoPoint } from '../../location/location.model';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
import { SocketService } from '../../shared/socket.service';
import { Router } from '@angular/router';
import { AuthService } from '../../account/auth.service';
import { DeliverTimeActions } from '../main.actions';
import { IDeliverTimeAction, IPageAction } from '../main.reducers';
import { LocationActions } from '../../location/location.actions';
import { ILocationAction } from '../../location/location.reducer';
import { Subject } from '../../../../node_modules/rxjs';

declare var google;

const APP = environment.APP;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
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
  lunchTime = { start: '11:45', end: '13:45' };
  overdue;
  afternoon;
  deliveryDiscount = 2;
  deliveryTime = 'immediate';
  malls = [
    {
      id: '1', name: 'Richmond Hill', type: 'real', lat: 43.8461479, lng: -79.37935279999999, radius: 2,
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
      workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }
      ]
    },
  ];
  realMalls = [];
  inRange = false;
  onDestroy$ = new Subject<any>();

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private sharedSvc: SharedService,
    private authSvc: AuthService,
    private socketSvc: SocketService,
    private route: Router,
    private rx: NgRedux<IAppState>,
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

    this.rx.dispatch<IPageAction>({
      type: PageActions.UPDATE_URL,
      payload: 'home'
    });

    // this.rx.select('cmd').pipe(
    //   takeUntil(this.onDestroy$)
    // ).subscribe((x: ICommand) => {
    //   if (x.name === 'show-location-history') {
    //     this.onAddressInputFocus();
    //   } else if ( x.name === 'input-address') {
    //     this.handleAddressChange(x.args);
    //   } else if ( x.name === 'clear-address-input') {
    //     this.handleAddressClear();
    //   } else if ( x.name === 'use-current-location') {
    //     this.useCurrentLocation();
    //   }
    // });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  calcDistancesToMalls(center: ILatLng) {
    const self = this;
    let inRange = false;
    this.malls.filter(x => x.type === 'virtual').map(mall => {
      if (self.locationSvc.getDirectDistance(center, mall) < mall.radius * 1000) {
        inRange = true;
      }
    });
    this.inRange = inRange;
  }

  onAddressInputFocus(e) {
    const self = this;
    this.bHideMap = true;
    this.bTimeOptions = false;
    this.options = [];
    if (this.account && this.account.id) {
      this.locationSvc.find({ where: { userId: this.account.id } }).subscribe((lhs: ILocationHistory[]) => {
        const options = [];
        for (const lh of lhs) {
          const loc = lh.location;
          const p: IPlace = {
            type: 'history',
            structured_formatting: {
              main_text: loc.street_number + ' ' + loc.street_name,
              secondary_text: (loc.sub_locality ? loc.sub_locality : loc.city) + ',' + loc.province
            },
            location: loc
          };
          options.push(p);
        }
        self.options = options;
      });
    }
  }

  onSelectPlace(e) {
    const r: ILocation = e.location;
    this.options = [];
    if (r) {
      this.rx.dispatch<ILocationAction>({
        type: LocationActions.UPDATE,
        payload: r
      });
      this.bHideMap = false;
      this.center = { lat: r.lat, lng: r.lng };
      this.bTimeOptions = true;
      this.calcDistancesToMalls({ lat: r.lat, lng: r.lng });
      this.deliveryAddress = e.address; // set address text to input
      this.mapFullScreen = false;
    }
  }

  onAddressChange(e) {
    const self = this;
    this.bHideMap = true;
    this.bTimeOptions = false;
    this.options = [];
    this.locationSvc.reqPlaces(e.input).subscribe((ps: IPlace[]) => {
      if (ps && ps.length > 0) {
        for (const p of ps) {
          p.type = 'suggest';
          self.options.push(p); // without lat lng
        }
      }
    });
    this.mapFullScreen = false;

  }


  onAddressClear(e) {
    this.deliveryAddress = '';
    this.mapFullScreen = true;
    this.options = [];
    this.bHideMap = false;
    this.bTimeOptions = false;
  }

  useCurrentLocation() {
    const self = this;
    self.options = [];
    this.locationSvc.getCurrentLocation().then(r => {
      self.bHideMap = false;
      self.mapFullScreen = false;
      self.bTimeOptions = true;
      self.sharedSvc.emitMsg({name: 'OnUpdateAddress', addr: r});
      self.deliveryAddress = self.locationSvc.getAddrString(r); // set address text to input
      self.center = { lat: r.lat, lng: r.lng };
      self.calcDistancesToMalls({ lat: r.lat, lng: r.lng });

      self.rx.dispatch<ILocationAction>({
        type: LocationActions.UPDATE,
        payload: r
      });

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

  showMap() {
    return !(this.options && this.options.length > 0);
  }

  getMapHeight() {
    return this.mapFullScreen ? '700px' : '220px';
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
