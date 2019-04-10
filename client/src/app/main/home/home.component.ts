import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import { ILocationHistory, IPlace, ILocation, ILatLng, GeoPoint } from '../../location/location.model';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
import { SocketService } from '../../shared/socket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../account/auth.service';
import { IPageAction } from '../main.reducers';
import { LocationActions } from '../../location/location.actions';
import { ILocationAction } from '../../location/location.reducer';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { ICommand } from '../../shared/command.reducers';
import { IDeliveryTime } from '../../delivery/delivery.model';
import { IDeliveryTimeAction } from '../../delivery/delivery-time.reducer';
import { DeliveryTimeActions } from '../../delivery/delivery-time.actions';
import { Account } from '../../account/account.model';
import { AccountActions } from '../../account/account.actions';
import { MatSnackBar } from '../../../../node_modules/@angular/material';

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
  places: IPlace[];
  deliveryAddress = '';
  placeholder = 'Delivery Address';
  mapFullScreen = true;
  subscrAccount;
  account;
  bHideMap = false;
  bTimeOptions = false;
  orderDeadline = { h: 9, m: 30 };
  overdue;
  afternoon;
  deliveryTime: IDeliveryTime = { type: '', text: '' };

  inRange = false;
  onDestroy$ = new Subject<any>();

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private authSvc: AuthService,
    private socketSvc: SocketService,
    private router: Router,
    private route: ActivatedRoute,
    private rx: NgRedux<IAppState>,
    private snackBar: MatSnackBar
  ) {
    const self = this;
    this.route.queryParamMap.subscribe(queryParams => {
      const code = queryParams.get('code');
      this.accountSvc.wechatLogin(code).subscribe((data: any) => {
        if (data) {
          self.authSvc.setUserId(data.userId);
          self.authSvc.setAccessToken(data.id);
          self.accountSvc.getCurrentUser().subscribe((account: Account) => {
            if (account) {
              self.rx.dispatch({ type: AccountActions.UPDATE, payload: account });
              this.snackBar.open('', '微信登录成功。', {
                duration: 2000
              });
            } else {
              this.snackBar.open('', '微信登录失败。', {
                duration: 1000
              });
            }
          });
        }
      });
      // this.accountSvc.getWechatAccessToken(code).subscribe((x: any) => {
      //   if (x.access_token) {
      //     const accessToken = x.access_token;
      //     const openId = x.openid;

      //     // "access_token":"ACCESS_TOKEN",
      //     // "expires_in":7200,
      //     // "refresh_token":"REFRESH_TOKEN",
      //     // "openid":"OPENID",
      //   } else {
      //     // {"errcode":40029,"errmsg":"invalid code"}
      //   }
      // });
    });
  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrent().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(account => {
      self.account = account;
      self.socketSvc.init(this.authSvc.getAccessToken());
    });
    this.rx.dispatch<IPageAction>({
      type: PageActions.UPDATE_URL,
      payload: 'home'
    });
    this.rx.select('cmd').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x: ICommand) => {
      if (x.name === 'clear-address') {
        this.places = [];
      }
    });
    this.rx.select('location').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((loc: ILocation) => {
      if (loc) {
        self.deliveryAddress = self.locationSvc.getAddrString(loc);
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onAddressInputFocus(e?: any) {
    const self = this;
    this.places = [];
    if (this.account && this.account.id) {
      this.locationSvc.getHistoryLocations(this.account.id).then(a => {
        self.places = a;
      });
    }
  }

  onSelectPlace(e) {
    const r: ILocation = e.location;
    this.places = [];
    if (r) {
      this.rx.dispatch<ILocationAction>({
        type: LocationActions.UPDATE,
        payload: r
      });
      this.deliveryAddress = e.address; // set address text to input
      this.router.navigate(['main/filter']);
    }
  }

  onAddressChange(e) {
    const self = this;
    this.places = [];
    this.locationSvc.reqPlaces(e.input).subscribe((ps: IPlace[]) => {
      if (ps && ps.length > 0) {
        for (const p of ps) {
          p.type = 'suggest';
          self.places.push(p); // without lat lng
        }
      }
    });
  }

  onAddressClear(e) {
    this.deliveryAddress = '';
    this.places = [];
    this.onAddressInputFocus();
  }

  useCurrentLocation() {
    const self = this;
    self.places = [];
    this.locationSvc.getCurrentLocation().then(r => {
      self.deliveryAddress = self.locationSvc.getAddrString(r); // set address text to input

      self.rx.dispatch<ILocationAction>({
        type: LocationActions.UPDATE,
        payload: r
      });

      this.router.navigate(['main/filter']);
      // fix me!!!
      // if (self.account) {
      //   self.locationSvc.save({ userId: self.account.id, type: 'history',
      //     placeId: r.place_id, location: r, created: new Date() }).subscribe(x => {
      //   });
      // }
    },
      err => {
        console.log(err);
      });
  }

  showLocationList() {
    return this.places && this.places.length > 0;
  }

}
