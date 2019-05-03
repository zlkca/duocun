import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import { ILocationHistory, IPlace, ILocation, ILatLng, GeoPoint } from '../../location/location.model';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
// import { SocketService } from '../../shared/socket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../account/auth.service';
import { IPageAction } from '../main.reducers';
import { LocationActions } from '../../location/location.actions';
import { ILocationAction } from '../../location/location.reducer';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { ICommand } from '../../shared/command.reducers';
import { Account, IAccount } from '../../account/account.model';
import { AccountActions } from '../../account/account.actions';
import { MatSnackBar, MatTooltip } from '../../../../node_modules/@angular/material';
import { ContactService } from '../../contact/contact.service';
import { IContact, Contact } from '../../contact/contact.model';
import { CommandActions } from '../../shared/command.actions';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { IAddressAction } from '../../location/address.reducer';
import { AddressActions } from '../../location/address.actions';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { IDeliveryAction } from '../../delivery/delivery.reducer';

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
  account: IAccount;
  bHideMap = false;
  bTimeOptions = false;
  orderDeadline = { h: 9, m: 30 };
  overdue;
  afternoon;
  contact;
  inRange = false;
  onDestroy$ = new Subject<any>();
  loading = false;
  location;
  bFirstTime = true;
  bInputLocation = false;
  placeForm;
  historyAddressList = [];
  suggestAddressList = [];
  @ViewChild('tooltip') tooltip: MatTooltip;

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private authSvc: AuthService,
    private contactSvc: ContactService,
    // private socketSvc: SocketService,
    private router: Router,
    private route: ActivatedRoute,
    private rx: NgRedux<IAppState>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    const self = this;
    this.placeForm = this.fb.group({
      addr: ['']
    });
    this.loading = true;
    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: 'home' });

    this.rx.select('location').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((loc: ILocation) => {
      if (loc) {
        self.deliveryAddress = self.locationSvc.getAddrString(loc);
        self.placeForm.get('addr').patchValue(self.deliveryAddress);
        if (self.deliveryAddress) {
          self.getSuggestLocationList(self.deliveryAddress, false);
        }
      }
    });

    self.route.queryParamMap.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(queryParams => {
      const code = queryParams.get('code');

      self.accountSvc.getCurrent().pipe(
        takeUntil(this.onDestroy$)
      ).subscribe(account => {
        if (account) {
          self.bFirstTime = !account.visited ? true : false;
          self.account = account;
          self.init(account);
          this.loading = false;
        } else {
          if (code) {
            this.loading = true;
            this.accountSvc.wechatLogin(code).pipe(
              takeUntil(this.onDestroy$)
            ).subscribe((data: any) => {
              if (data) {
                self.wechatLoginHandler(data);
              } else { // failed from shared link login
                // tslint:disable-next-line:max-line-length
                this.loading = false;
                window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx0591bdd165898739&redirect_uri=https://duocun.com.cn&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';
              }
            });
          } else { // no code in router
            this.loading = false;
          }
        }
      }, err => {
        this.loading = false;
        console.log('login failed');
      });
    });

  }

  wechatLoginHandler(data: any) {
    const self = this;
    self.authSvc.setUserId(data.userId);
    self.authSvc.setAccessToken(data.id);
    self.accountSvc.getCurrentUser().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: Account) => {
      if (account) {
        self.bFirstTime = !account.visited ? true : false;
        self.account = account;

        this.snackBar.open('', '微信登录成功。', {
          duration: 1000
        });
        self.loading = false;
        self.init(account);
      } else {
        this.snackBar.open('', '微信登录失败。', {
          duration: 1000
        });
        self.loading = false;
      }
    });
  }

  init(account: Account) {
    const self = this;
    self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'loggedIn', args: null } });
    self.rx.dispatch({ type: AccountActions.UPDATE, payload: account });
    this.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'firstTimeUse', args: this.bFirstTime } });
    this.locationSvc.getHistoryLocations(this.account.id).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((a: IPlace[]) => {
      if (a && a.length > 0) {
        a.map(x => { x.type = 'history'; });
        self.historyAddressList = a;
      }
    });
    // self.socketSvc.init(this.authSvc.getAccessToken());

    // redirect to filter if contact have default address
    self.contactSvc.find({ where: { accountId: account.id } }).pipe(
      takeUntil(self.onDestroy$)
    ).subscribe((r: IContact[]) => {
      if (r && r.length > 0) {
        self.contact = new Contact(r[0]);

        if (self.contact.location) {
          self.rx.dispatch<ILocationAction>({
            type: LocationActions.UPDATE,
            payload: self.contact.location
          });
          self.deliveryAddress = self.locationSvc.getAddrString(r[0].location); // set address text to input
          self.router.navigate(['main/filter']);
        }
      }
    });
  }

  ngOnInit() {
    const self = this;
    this.places = []; // clear address list

    this.rx.dispatch<IPageAction>({
      type: PageActions.UPDATE_URL,
      payload: 'home'
    });
    this.rx.select('cmd').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x: ICommand) => {
      if (x.name === 'clear-location-list') {
        this.places = [];
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  // useCurrentLocation() {
  //   const self = this;
  //   self.places = [];
  //   self.bFirstTime = false;
  //   self.loading = true;
  //   this.locationSvc.getCurrentLocation().then(r => {
  //     self.loading = false;
  //     self.deliveryAddress = self.locationSvc.getAddrString(r); // set address text to input

  //     self.rx.dispatch<ILocationAction>({
  //       type: LocationActions.UPDATE,
  //       payload: r
  //     });

  //     this.router.navigate(['main/filter']);
  //   },
  //     err => {
  //       console.log(err);
  //     });
  // }

  showLocationList() {
    return this.places && this.places.length > 0;
  }

  onAddressInputFocus(e?: any) {
    const self = this;
    this.places = [];

    if (this.bFirstTime) {
      this.bFirstTime = false;
      if (this.account) {
        this.account.visited = true;
        this.rx.dispatch({ type: AccountActions.UPDATE, payload: this.account });
        this.accountSvc.update({ id: this.account.id }, { visited: true }).pipe(
          takeUntil(this.onDestroy$)
        ).subscribe(r => {
          console.log('update user account');
        });
      }
    }

    if (this.account) {
      if (e.input) {
        this.places = this.suggestAddressList;
        // this.getSuggestLocationList(e.input);
      } else {
        this.places = this.historyAddressList.map(x => Object.assign({}, x));
      }
    }

  }

  onAddressInputChange(e) {
    const v = e.input;
    if (v && v.length >= 3) {
      this.rx.dispatch<IAddressAction>({
        type: AddressActions.UPDATE,
        payload: v
      });
      // this.bFirstTime = false;
      // this.account.visited = true;
      // this.rx.dispatch({ type: AccountActions.UPDATE, payload: this.account });
      this.getSuggestLocationList(e.input, true);
    }
  }

  onBack() {
    // this.deliveryAddress = '';
    this.places = [];
  }

  onAddressInputClear(e) {
    this.deliveryAddress = '';
    this.places = [];
    this.onAddressInputFocus();
  }

  getSuggestLocationList(input: string, bShowList: boolean) {
    const self = this;
    this.places = [];
    this.locationSvc.reqPlaces(input).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((ps: IPlace[]) => {
      if (ps && ps.length > 0) {
        const places = [];
        ps.map(p => {
          p.type = 'suggest';
          places.push(Object.assign({}, p));
        });

        self.suggestAddressList = places;
        if (bShowList) {
          self.places = places; // without lat lng
        }

      }
    });
  }

  onSelectPlace(e) {
    const self = this;
    const r: ILocation = e.location;
    this.places = [];
    if (r) {
      this.location = r;
      this.deliveryAddress = e.address; // set address text to input
      this.rx.dispatch<IDeliveryAction>({type: DeliveryActions.UPDATE_ORIGIN, payload: {origin: r}});

      if (self.account) {
        const query = { where: { userId: self.account.id, placeId: r.placeId } };
        const lh = {
          userId: self.account.id, type: 'history',
          placeId: r.placeId, location: r, created: new Date()
        };
        self.locationSvc.saveIfNot(query, lh).pipe(
          takeUntil(this.onDestroy$)
        ).subscribe(() => {

        });
      }

      this.router.navigate(['main/filter']);
    }
  }
}
