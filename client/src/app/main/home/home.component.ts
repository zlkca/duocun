import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import { ILocationHistory, IPlace, ILocation, GeoPoint } from '../../location/location.model';
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
import { CommandActions } from '../../shared/command.actions';
import { IAddressAction } from '../../location/address.reducer';
import { AddressActions } from '../../location/address.actions';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { IDeliveryAction } from '../../delivery/delivery.reducer';
import * as moment from 'moment';
import { RangeService } from '../../range/range.service';
import { IRange } from '../../range/range.model';
import { AreaService } from '../../area/area.service';
import { MerchantType, IMerchant, MerchantStatus } from '../../merchant/merchant.model';
import { MerchantService } from '../../merchant/merchant.service';
import { IDelivery } from '../../delivery/delivery.model';
import { resolve } from 'url';

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
  inRange = true;
  onDestroy$ = new Subject<any>();
  loading = true;
  merchants;
  location: ILocation;
  bUpdateLocationList = true;
  bInputLocation = false;
  // placeForm;
  historyAddressList = [];
  suggestAddressList = [];

  mapRanges;
  mapZoom;
  mapCenter;
  areas; // for display downtown in map

  availableRanges;
  sOrderDeadline;
  bAddressList = false;
  bPayment = false;
  lang = environment.language;
  bOrderEnded = false;

  date = { code: 'L', type: 'today' }; // default value
  menu = 'home';

  @ViewChild('tooltip', { static: true }) tooltip: MatTooltip;

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private authSvc: AuthService,
    private rangeSvc: RangeService,
    private areaSvc: AreaService,
    private merchantSvc: MerchantService,
    // private socketSvc: SocketService,
    private router: Router,
    private route: ActivatedRoute,
    private rx: NgRedux<IAppState>,
    private snackBar: MatSnackBar,
    // private fb: FormBuilder
  ) {
    const self = this;

    // this.placeForm = this.fb.group({ addr: [''] });

    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: { name: 'home' } });


    // receive delivery from merchant detail page click brower back button event
    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((d: IDelivery) => {
      if (d && d.dateType) {
        this.date = d.dateType === 'today' ? { code: 'L', type: 'today' } : { code: 'R', type: 'tomorrow' };
      } else { // set default date
        if (this.date.code === 'L') {
          const today = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          this.rx.dispatch({ type: DeliveryActions.UPDATE_DATE, payload: { date: today, dateType: 'today' } });
        } else {
          const tomorrow = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(1, 'days');
          this.rx.dispatch({ type: DeliveryActions.UPDATE_DATE, payload: { date: tomorrow, dateType: 'tomorrow' } });
        }
      }

      // reload address in address search
      this.location = d ? d.origin : null;
      if (d && d.origin) {
        self.deliveryAddress = self.locationSvc.getAddrString(d.origin);
      }
    });

    this.places = []; // clear address list
    this.rx.dispatch<IPageAction>({ type: PageActions.UPDATE_URL, payload: { name: 'home' } });
    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'clear-location-list') {
        this.places = [];
      }
    });

  }

  login(code) {
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
        if (account) {
          resolve(account);
        } else {
          if (code) { // try wechat login
            this.accountSvc.wxLogin(code).then((r: any) => {
              if (r) {
                this.accountSvc.setAccessTokenId(r.tokenId);
                resolve(r.account);
              } else {
                resolve();
              }
            });
          } else {
            resolve();
          }
        }
      });
    });
  }

  // process url and redirect to corresponding process
  routeUrl() {
    const self = this;
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      self.route.queryParamMap.pipe(takeUntil(this.onDestroy$)).subscribe(queryParams => {
        // if url has format '...?clientId=x&page=y', it is some procedure that re-enter the home page
        const clientId = queryParams.get('cId'); // use for after card pay, could be null
        const page = queryParams.get('p');

        if (page === 'b') { // for wechatpay add credit procedure
          self.accountSvc.quickFind({ _id: clientId }).pipe(takeUntil(this.onDestroy$)).subscribe((accounts: IAccount[]) => {
            self.rx.dispatch({ type: AccountActions.UPDATE, payload: accounts[0] });
            self.router.navigate(['account/balance']);
            resolve();
          });
        } else if (page === 'h') { // for wechatpay procedure
          if (clientId) {
            self.bPayment = true;
            self.accountSvc.quickFind({ _id: clientId }).pipe(takeUntil(this.onDestroy$)).subscribe((accounts: IAccount[]) => {
              self.rx.dispatch({ type: AccountActions.UPDATE, payload: accounts[0] });
              self.router.navigate(['order/history']);
              resolve();
            });
          }
        } else {
          const code = queryParams.get('code');
          this.loading = true;
          this.login(code).then((account: IAccount) => {
            if (account) { // if already use cookie to login
              self.account = account;
              self.snackBar.open('', '微信登录成功。', { duration: 1000 });
              self.init(account).then((origin: any) => {
                resolve(origin);
              });
            } else {
              self.snackBar.open('', '微信登录失败。', { duration: 1000 });
              resolve();
            }
          });

          // v1
          // try default login
          // self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
          //   if (account) { // if already use cookie to login
          //     self.account = account;
          //     self.snackBar.open('', '微信登录成功。', { duration: 1000 });
          //     self.init(account).then((origin: any) => {
          //       resolve(origin);
          //     });
          //   } else {
          //     const code = queryParams.get('code');
          //     if (code) { // try wechat login
          //       this.accountSvc.wechatLogin(code).pipe(takeUntil(this.onDestroy$)).subscribe((tokenId: string) => {
          //         if (tokenId) {
          //           self.authSvc.setAccessTokenId(tokenId);
          //           // retry default login
          //           self.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((accountWX: Account) => {
          //             if (accountWX) {
          //               self.account = accountWX;
          //               self.snackBar.open('', '微信登录成功。', { duration: 1000 });
          //               self.init(accountWX).then((origin: any) => {
          //                 resolve(origin);
          //               });
          //             } else {
          //               self.snackBar.open('', '微信登录失败。', { duration: 1000 });
          //               resolve();
          //             }
          //           });
          //         } else { // failed from shared link login
          //           this.loading = false;

          //           setTimeout(() => {
          //             // redirect to wechat authorize button page
          //             window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + WECHAT_APP_ID
          //               + '&redirect_uri=' + WECHAT_REDIRCT_URL
          //               + '&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';

          //             resolve(); // fix me !!!
          //           }, 500);
          //         }
          //       });
          //     } else { // no code in router, means did not use wechat login, and failed to use default login (en version eg.)
          //       resolve();
          //     }
          //   }
          // }, err => {
          //   resolve();
          // });
        }
      });
    });
  }

  updateMap(origin, inRange) {
    const self = this;
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      this.rangeSvc.find({ status: 'active' }).pipe(takeUntil(this.onDestroy$)).subscribe((rs: IRange[]) => {
        this.mapRanges = rs;

        if (inRange) {
          self.mapZoom = 14;
          self.mapCenter = origin;
          this.location = origin; // order matters
          resolve();
        } else {
          // this.areaSvc.find({ code: 'DT' }).pipe(takeUntil(this.onDestroy$)).subscribe((areas: any[]) => {
          const farNorth = { lat: 44.2653618, lng: -79.4191007 };

          self.mapZoom = 9;
          self.mapCenter = {
            lat: (origin.lat + farNorth.lat) / 2,
            lng: (origin.lng + farNorth.lng) / 2
          };
          // self.areas = areas;
          self.location = origin; // order matters
          resolve();
          // });
        }
      });
    });
  }

  updateFooterStatus(account: IAccount) {
    this.rx.dispatch({ type: CommandActions.SEND, payload: { name: 'loggedIn', args: null } }); // for updating footer
    this.rx.dispatch({ type: AccountActions.UPDATE, payload: account });
  }

  init(account: IAccount) {
    const self = this;
    const accountId = account ? account._id : null;

    this.updateFooterStatus(account);

    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      if (accountId) {
        this.locationSvc.find({ accountId: accountId }).pipe(takeUntil(this.onDestroy$)).subscribe((lhs: ILocationHistory[]) => {
          const a = this.locationSvc.toPlaces(lhs);
          self.historyAddressList = a;

          if (self.location) {
            resolve(self.location);
          } else {
            // redirect to filter if account have default location
            if (account && account.location) {
              self.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: account.location } });
              self.bUpdateLocationList = false;
              self.deliveryAddress = self.locationSvc.getAddrString(account.location); // set address text to input
              resolve(account.location);
            } else {
              resolve(self.location);
            }
          }
        });
      } else {
        self.historyAddressList = [];
        self.bUpdateLocationList = false;
        self.deliveryAddress = '';
        resolve(self.location);
      }
    });
  }

  ngOnInit() {
    const self = this;
    this.routeUrl().then((origin: any) => {
      // check range and update map or merchant list
      if (origin) {
        self.rangeSvc.inDeliveryRange(origin).pipe(takeUntil(this.onDestroy$)).subscribe(inRange => {
          self.inRange = inRange;
          if (inRange) {
            self.loadRestaurants(origin, self.date.type).then(rs => {
              self.loading = false;
            });
          } else {
            self.updateMap(origin, inRange).then(() => {
              self.merchants = [];
              self.loading = false;
            });
          }
        });
      } else {
        self.loadRestaurants(null, self.date.type).then(rs => {
          self.loading = false;
        });
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
    const account = this.account;
    this.places = [];
    this.bUpdateLocationList = true;

    if (account) {
      // const accountId = account._id;
      // const visited = account.visited;
      // if (!visited) {
      //   this.account.visited = true;
      //   this.accountSvc.update({ _id: accountId }, { visited: true }).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      //     this.rx.dispatch({ type: AccountActions.UPDATE, payload: this.account });
      //   });
      // }

      if (e.input) {
        this.places = this.suggestAddressList;
      } else {
        this.places = this.historyAddressList.map(x => Object.assign({}, x));
      }
      this.bAddressList = true;
    }
  }

  onAddressInputChange(e) {
    const v = e.input;
    if (v && v.length >= 3) {
      this.rx.dispatch<IAddressAction>({
        type: AddressActions.UPDATE,
        payload: v
      });
      this.getSuggestLocationList(e.input, true);
      this.bAddressList = true;
    }
  }

  onBack() {
    // this.deliveryAddress = '';
    this.places = [];
    this.loading = true;
    this.rangeSvc.inDeliveryRange(this.location).pipe(takeUntil(this.onDestroy$)).subscribe(inRange => {
      this.inRange = inRange;
      this.loadRestaurants(this.location, this.date.type).then(rs => {
        this.loading = false;
      });
    });
  }

  onAddressInputClear(e) {
    this.deliveryAddress = '';
    this.location = null;
    this.places = [];
    this.bUpdateLocationList = true;
    this.rx.dispatch({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: null } });
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

  // callback of the location list selection
  onSelectPlace(e) {
    const self = this;
    const r: ILocation = e.location;
    this.places = [];
    this.bUpdateLocationList = false;
    this.location = r;
    this.bAddressList = false;
    this.loading = true;
    if (r) {
      this.deliveryAddress = e.address; // set address text to input
      this.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: r } });

      if (self.account) {
        const accountId = self.account._id;
        const accountName = self.account.username;
        const query = { accountId: accountId, placeId: r.placeId };
        const lh = { accountId: accountId, accountName: accountName, placeId: r.placeId, location: r };

        self.locationSvc.upsertOne(query, lh).pipe(takeUntil(this.onDestroy$)).subscribe(() => {

        });
      }

      self.bUpdateLocationList = false;
      self.rx.dispatch({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: r } });
      self.deliveryAddress = self.locationSvc.getAddrString(r); // set address text to input
      self.location = r; // update merchant list

      const origin = self.location;

      self.rangeSvc.inDeliveryRange(origin).pipe(takeUntil(this.onDestroy$)).subscribe(inRange => {
        self.inRange = inRange;
        if (inRange) {
          self.loadRestaurants(origin, self.date.type).then(rs => {
            self.loading = false;
          });
        } else {
          self.updateMap(origin, inRange).then(() => {
            self.merchants = [];
            self.loading = false;
          });
        }
      });
    } else {
      self.loadRestaurants(null, self.date.type).then(rs => {
        self.loading = false;
      });
    }
  }

  onDateChange(e) {
    const self = this;
    this.date = { code: e, type: e === 'L' ? 'today' : 'tomorrow' };
    if (e === 'L') {
      const today = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      this.rx.dispatch({ type: DeliveryActions.UPDATE_DATE, payload: { date: today, dateType: 'today' } });
    } else {
      const tomorrow = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(1, 'days');
      this.rx.dispatch({ type: DeliveryActions.UPDATE_DATE, payload: { date: tomorrow, dateType: 'tomorrow' } });
    }
    // this.loading = true;
    this.loadRestaurants(this.location, self.date.type).then(rs => {
      // self.loading = false;
    });
  }

  resetAddress() {
    this.location = null;
    this.inRange = true;
    this.deliveryAddress = '';
  }

  // -----------------------------------------------------
  // dateType --- string 'today', 'tomorrow'
  loadRestaurants(origin: ILocation, dateType: string) {
    const self = this;
    const query = { status: MerchantStatus.ACTIVE, type: MerchantType.RESTAURANT };
    this.location = origin;

    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      if (origin) {
        this.merchantSvc.load(origin, dateType, query).pipe(takeUntil(self.onDestroy$)).subscribe((rs: IMerchant[]) => {
          self.merchants = rs;
          self.bOrderEnded = !rs.some(m => !m.orderEnded);
          resolve(rs);
        });
      } else {
        this.merchantSvc.find(query).pipe(takeUntil(self.onDestroy$)).subscribe((rs: IMerchant[]) => {
          self.merchants = rs;
          self.bOrderEnded = !rs.some(m => !m.orderEnded);
          resolve(rs);
        });
      }
    });
  }

}
