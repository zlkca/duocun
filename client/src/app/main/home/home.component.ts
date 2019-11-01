import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { ICommand } from '../../shared/command.reducers';
import { Account, IAccount } from '../../account/account.model';
import { AccountActions } from '../../account/account.actions';
import { MatSnackBar, MatTooltip } from '../../../../node_modules/@angular/material';
import { ContactService } from '../../contact/contact.service';
import { IContact, Contact } from '../../contact/contact.model';
import { CommandActions } from '../../shared/command.actions';
import { IAddressAction } from '../../location/address.reducer';
import { AddressActions } from '../../location/address.actions';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { IDeliveryAction } from '../../delivery/delivery.reducer';
import { IDelivery } from '../../delivery/delivery.model';
import { ContactActions } from '../../contact/contact.actions';
import * as moment from 'moment';
import { RangeService } from '../../range/range.service';
import { MerchantService } from '../../merchant/merchant.service';
import { BalanceService } from '../../payment/balance.service';
import { IBalance } from '../../payment/payment.model';

const WECHAT_APP_ID = environment.WECHAT.APP_ID;
const WECHAT_REDIRCT_URL = environment.WECHAT.REDIRECT_URL;

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
  // overdue;
  afternoon;
  contact;
  inRange = false;
  onDestroy$ = new Subject<any>();
  loading = false;
  location;
  bFirstTime = true;
  bUpdateLocationList = true;
  bInputLocation = false;
  placeForm;
  historyAddressList = [];
  suggestAddressList = [];
  selectedDate = 'today';
  date; // moment object
  address: ILocation;
  compareRanges;
  mapZoom;
  rangeMap;
  mapCenter;
  availableRanges;
  sOrderDeadline;
  today;
  tomorrow;
  bAddressList = false;

  phase = 'today:lunch';

  @ViewChild('tooltip', { static: true }) tooltip: MatTooltip;

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private authSvc: AuthService,
    private contactSvc: ContactService,
    private rangeSvc: RangeService,
    private merchantSvc: MerchantService,
    private clientBalanceSvc: BalanceService,
    // private socketSvc: SocketService,
    private router: Router,
    private route: ActivatedRoute,
    private rx: NgRedux<IAppState>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    const self = this;
    const today = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const tomorrow = moment().add(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    // For display purpose only
    this.today = { type: 'lunch today', text: '今天午餐', date: today.format('YYYY-MM-DD'), startTime: '11:45', endTime: '13:15' };
    this.tomorrow = { type: 'lunch tomorrow', text: '今天午餐', date: tomorrow.format('YYYY-MM-DD'), startTime: '11:45', endTime: '13:15' };

    this.placeForm = this.fb.group({ addr: [''] });
    this.loading = true;

    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: { name: 'home' } });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((d: IDelivery) => {
      if (d && d.origin) {
        self.deliveryAddress = self.locationSvc.getAddrString(d.origin);
        self.placeForm.get('addr').patchValue(self.deliveryAddress);
        if (self.deliveryAddress && self.bUpdateLocationList) {
          self.getSuggestLocationList(self.deliveryAddress, false);
          self.bAddressList = false;
        }
        this.address = d.origin;
        this.checkRange(d.origin);
      } else {
        this.address = null;
        this.inRange = true;
      }

      if (d && d.date) { // moment
        self.selectedDate = moment().isSame(d.date, 'day') ? 'today' : 'tomorrow';
        self.date = d.date;
      } else { // by default select today moment object
        this.rx.dispatch({ type: DeliveryActions.UPDATE_DATE, payload: { date: today, dateType: 'today' } });
        this.date = today;
      }
    });


    self.route.queryParamMap.pipe(takeUntil(this.onDestroy$)).subscribe(queryParams => {
      const code = queryParams.get('code');

      const bRedirectPayComplete = this.processPay(queryParams);
      if (bRedirectPayComplete) {
        return;
      }

      self.accountSvc.getCurrent().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
        if (account) { // if already login
          this.loading = false;

          self.bFirstTime = !account.visited ? true : false;
          self.account = account;
          self.init(account);

        } else {
          if (code) {
            this.loading = true;
            this.accountSvc.wechatLogin(code).pipe(takeUntil(this.onDestroy$)).subscribe((data: any) => {
              if (data) {
                self.wechatLoginHandler(data);
              } else { // failed from shared link login
                this.loading = false;

                // redirect to wechat authorize button page
                window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + WECHAT_APP_ID
                  + '&redirect_uri=' + WECHAT_REDIRCT_URL
                  + '&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';
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

  processPay(queryParams: any) {
    const orderId = queryParams.get('orderId'); // use for after card pay, could be null
    const clientId = queryParams.get('clientId'); // use for after card pay, could be null
    const amount = queryParams.get('amount'); // use for after card pay, could be null
    const paymentMethod = queryParams.get('paymentMethod'); // use for after card pay, could be null
    if (orderId && clientId && amount) {
      this.router.navigate(['/payment/complete'], {
        queryParams: {
          msg: 'success', orderId: orderId, clientId: clientId, amount: amount, paymentMethod: paymentMethod
        }
      });
      return true;
    } else {
      return false;
    }
  }

  // data : {id:'xxx', ttl: 10000, userId: 'xxxxx' }
  wechatLoginHandler(data: any) {
    const self = this;
    self.authSvc.setUserId(data.userId);
    self.authSvc.setAccessToken(data.id);
    self.accountSvc.getCurrentUser().pipe(takeUntil(this.onDestroy$)).subscribe((account: Account) => {
      if (account) {
        self.bFirstTime = !account.visited ? true : false;
        self.account = account;

        this.snackBar.open('', '微信登录成功。', { duration: 1000 });
        self.loading = false;
        self.init(account);
      } else {
        this.snackBar.open('', '微信登录失败。', { duration: 1000 });
        self.loading = false;
      }
    });
  }

  init(account: Account) {
    const self = this;
    const accountId = account._id;

    self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'loggedIn', args: null } });
    self.rx.dispatch({ type: AccountActions.UPDATE, payload: account });
    self.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'firstTimeUse', args: this.bFirstTime } });

    this.locationSvc.find({ userId: accountId }).pipe(takeUntil(this.onDestroy$)).subscribe((lhs: ILocationHistory[]) => {
      const a = this.locationSvc.toPlaces(lhs);
      self.historyAddressList = a;
    });
    // self.socketSvc.init(this.authSvc.getAccessToken());

    // redirect to filter if contact have default address
    self.contactSvc.find({ accountId: accountId }).pipe(takeUntil(self.onDestroy$)).subscribe((r: IContact[]) => {
      if (r && r.length > 0) {
        self.contact = new Contact(r[0]);
        self.rx.dispatch({ type: ContactActions.LOAD_FROM_DB, payload: self.contact });
        if (self.contact.location) {
          self.bUpdateLocationList = false;
          self.rx.dispatch({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: self.contact.location } });
          self.deliveryAddress = self.locationSvc.getAddrString(self.contact.location); // set address text to input
          self.address = self.contact.location; // update merchant list
        }
      }
    });

    this.clientBalanceSvc.quickFind({ accountId: accountId }).pipe(takeUntil(self.onDestroy$)).subscribe((bs: IBalance[]) => {
      if (bs && bs.length > 0) {
        // update balance
      } else {
        // new balance entry
        const data: IBalance = {
          accountId: accountId,
          accountName: account.username,
          amount: 0,
          created: new Date(),
          modified: new Date()
        };

        self.clientBalanceSvc.save(data).pipe(takeUntil(self.onDestroy$)).subscribe((b: IBalance) => {
        });
      }
    });
  }

  ngOnInit() {
    this.places = []; // clear address list
    this.rx.dispatch<IPageAction>({ type: PageActions.UPDATE_URL, payload: { name: 'home' } });
    this.rx.select('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'clear-location-list') {
        this.places = [];
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  showLocationList() {
    return this.places && this.places.length > 0;
  }

  onAddressInputFocus(e?: any) {
    const self = this;
    const accountId = this.account._id;
    this.places = [];
    self.bUpdateLocationList = true;
    if (this.bFirstTime) {
      this.bFirstTime = false;
      if (this.account) {
        this.account.visited = true;
        this.rx.dispatch({ type: AccountActions.UPDATE, payload: this.account });
        this.accountSvc.update({ _id: accountId }, { visited: true }).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
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
      self.bAddressList = true;
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
      this.bAddressList = true;
    }
  }

  onBack() {
    // this.deliveryAddress = '';
    this.places = [];
  }

  onAddressInputClear(e) {
    this.deliveryAddress = '';
    this.places = [];
    this.bUpdateLocationList = true;
    this.rx.dispatch({
      type: DeliveryActions.UPDATE_ORIGIN,
      payload: { origin: null }
    });
    this.onAddressInputFocus({ input: '' });
  }

  getSuggestLocationList(input: string, bShowList: boolean) {
    const self = this;
    this.places = [];
    this.locationSvc.reqPlaces(input).pipe(takeUntil(this.onDestroy$)).subscribe((ps: IPlace[]) => {
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
    const accountId = self.account._id;
    const accountName = self.account.username;

    this.places = [];
    this.bUpdateLocationList = false;
    this.location = r;
    self.bAddressList = false;
    if (r) {
      this.deliveryAddress = e.address; // set address text to input
      this.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: r } });

      if (self.account) {
        const query = { userId: accountId, placeId: r.placeId };
        const lh = {
          userId: accountId, accountName: accountName, type: 'history',
          placeId: r.placeId, location: r, created: new Date()
        };

        self.locationSvc.saveIfNot(query, lh).pipe(takeUntil(this.onDestroy$)).subscribe(() => {

        });
      }

      if (r) {
        self.rx.dispatch({ type: ContactActions.UPDATE_LOCATION, payload: r });
        self.bUpdateLocationList = false;
        self.rx.dispatch({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: r } });
        self.deliveryAddress = self.locationSvc.getAddrString(r); // set address text to input
        self.address = r; // update merchant list
      }
    }
  }

  onSelectDate(e) {
    if (e.value === 'tomorrow') {
      const tomorrow = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(1, 'days');
      this.rx.dispatch({ type: DeliveryActions.UPDATE_DATE, payload: { date: tomorrow, dateType: 'tomorrow' } });
      this.phase = 'tomorrow:lunch';
    } else {
      const today = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      this.rx.dispatch({ type: DeliveryActions.UPDATE_DATE, payload: { date: today, dateType: 'today' } });
      this.phase = 'today:lunch';
    }
  }

  // ----------------------------------------
  // use for center the range map
  checkRange(origin) {
    const self = this;
    self.rangeSvc.find({ status: 'active' }).pipe(takeUntil(self.onDestroy$)).subscribe(ranges => {
      const rs = self.rangeSvc.getAvailableRanges({ lat: origin.lat, lng: origin.lng }, ranges);
      self.inRange = (rs && rs.length > 0) ? true : false;
      self.availableRanges = rs;
      if (self.inRange) {
        self.compareRanges = [];
        self.mapZoom = 14;
        self.rangeMap = false;
        self.mapCenter = origin;
      } else {
        self.compareRanges = ranges;
        self.mapZoom = 9;
        self.rangeMap = true;

        const farNorth = { lat: 44.2653618, lng: -79.4191007 };
        self.mapCenter = {
          lat: (origin.lat + farNorth.lat) / 2,
          lng: (origin.lng + farNorth.lng) / 2
        };
      }

      this.address = origin; // order matters
    });
  }

  resetAddress() {
    this.address = null;
    this.inRange = true;
    this.deliveryAddress = '';
  }

}
