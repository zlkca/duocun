import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { IPlace, ILocation, ILocationHistory, IDistance } from '../../location/location.model';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { PageActions } from '../../main/main.actions';
import { IContact, Contact } from '../contact.model';
import { IContactAction } from '../contact.reducer';
import { ContactActions } from '../contact.actions';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { ContactService } from '../contact.service';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import * as Cookies from 'js-cookie';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { IDeliveryAction } from '../../delivery/delivery.reducer';
import { RangeService } from '../../range/range.service';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { CartActions } from '../../cart/cart.actions';
import { IMall } from '../../mall/mall.model';
import { MallService } from '../../mall/mall.service';
import { DistanceService } from '../../location/distance.service';
import { IDelivery } from '../../delivery/delivery.model';
import { IRange } from '../../range/range.model';
import { CommandActions } from '../../shared/command.actions';
import { ICommand } from '../../shared/command.reducers';

@Component({
  selector: 'app-address-form-page',
  templateUrl: './address-form-page.component.html',
  styleUrls: ['./address-form-page.component.scss']
})
export class AddressFormPageComponent implements OnInit, OnDestroy {
  options;
  location; // onSelect from list
  deliveryAddress;
  account;
  contact: Contact;
  fromPage;
  form;
  onDestroy$ = new Subject<any>();
  inRange;
  compareRanges = [];
  mapZoom = 14;
  rangeMap = false;
  mapCenter;
  restaurant;
  suggestAddressList;
  historyAddressList;
  bUpdateLocationList = true;
  malls: IMall[];
  availableRanges: IRange[];
  delivered; // moment object
  onSchedule;

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private contactSvc: ContactService,
    private rangeSvc: RangeService,
    private mallSvc: MallService,
    private distanceSvc: DistanceService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.fromPage = this.route.snapshot.queryParamMap.get('fromPage');
    // if it is from account setting, try to load existing address, if it is from merchant detail page, load empty address.
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: { name: 'address-form', fromPage: this.fromPage }
    });

    this.mallSvc.find({ status: 'active' }).pipe(takeUntil(this.onDestroy$)).subscribe((malls: IMall[]) => {
      this.malls = malls;
    });

    this.rx.select<ICommand>('cmd').pipe(takeUntil(this.onDestroy$)).subscribe((x: ICommand) => {
      if (x.name === 'cancel-address') {
        this.cancel();
      } else if (x.name === 'save-address') {
        this.save();
      }
    });
  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrent().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      self.account = account;
      // if (this.account && this.account.id) {
      //   // load location option list
      //   this.locationSvc.find({ userId: this.account.id }).pipe(takeUntil(this.onDestroy$)).subscribe((lhs: ILocationHistory[]) => {
      //     const a = this.locationSvc.toPlaces(lhs);
      //     self.options = a;
      //   });
      // } else {
      //   self.options = [];
      // }

      this.locationSvc.find({ userId: this.account.id }).pipe(takeUntil(this.onDestroy$)).subscribe((lhs: ILocationHistory[]) => {
        const a = this.locationSvc.toPlaces(lhs);
        self.historyAddressList = a;
      });
    });

    this.rx.select('contact').pipe(takeUntil(this.onDestroy$)).subscribe((r: IContact) => {
      if (r) {
        self.contact = new Contact(r); // use for phone
        if (this.fromPage === 'account-setting') {
          if (r.location) { // select from location list
            self.deliveryAddress = this.locationSvc.getAddrString(r.location);
          } else if (r.address) { // initial address display
            self.deliveryAddress = r.address ? r.address : '';
          }
        } else {
          // self.deliveryAddress = '';
          self.deliveryAddress = self.locationSvc.getAddrString(r.location);
        }
        self.rx.dispatch({
          type: CommandActions.SEND,
          payload: { name: 'address-change', args: { address: self.deliveryAddress, inRange: self.inRange } }
        });
      }
    });

    this.rx.select('restaurant').pipe(takeUntil(this.onDestroy$)).subscribe((r: IRestaurant) => {
      self.restaurant = r;
    });

    this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((r: IDelivery) => {
      this.delivered = r.date;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }


  onAddressChange(e) {
    // const self = this;
    // this.options = [];
    // this.locationSvc.reqPlaces(e.input).pipe(takeUntil(this.onDestroy$)).subscribe((ps: IPlace[]) => {
    //   if (ps && ps.length > 0) {
    //     for (const p of ps) {
    //       p.type = 'suggest';
    //       self.options.push(p); // without lat lng
    //     }
    //   }
    // });

    this.getSuggestLocationList(e.input, true);
  }

  onAddressClear(e) {
    const self = this;
    this.location = null;
    this.deliveryAddress = '';

    this.options = [];
    if (this.fromPage !== 'account-setting') {
      this.rx.dispatch({
        type: DeliveryActions.UPDATE_ORIGIN,
        payload: { origin: null }
      });
    }
    self.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'address-change', args: { address: self.deliveryAddress, inRange: self.inRange } }
    });
    this.onAddressInputFocus({ input: '' });
  }

  onAddressInputFocus(e?: any) {
    const self = this;
    // this.options = [];
    // if (this.account && this.account.id) {
    //   this.locationSvc.find({ userId: this.account.id }).pipe(takeUntil(this.onDestroy$)).subscribe((lhs: ILocationHistory[]) => {
    //     const a = this.locationSvc.toPlaces(lhs);
    //     self.options = a;
    //   });
    // }

    if (this.account) {
      if (e.input) {
        this.options = this.suggestAddressList;
        // this.getSuggestLocationList(e.input);
      } else {
        this.options = this.historyAddressList.map(x => Object.assign({}, x));
      }
    }
  }

  onSelectPlace(e) {
    const self = this;
    const r: ILocation = e.location;
    this.options = [];
    if (r) {
      this.location = r;
      // this.deliveryAddress = e.address; // set address text to input
      self.deliveryAddress = self.locationSvc.getAddrString(r);
      // this.rx.dispatch({
      //   type: CommandActions.SEND,
      //   payload: { name: 'address-change', args: { address: self.deliveryAddress, inRange: self.inRange } }
      // });

      if (self.account) {
        const query = { userId: self.account.id, placeId: r.placeId };
        const lh = {
          userId: self.account.id, accountName: self.account.username, type: 'history',
          placeId: r.placeId, location: r, created: new Date()
        };
        self.locationSvc.saveIfNot(query, lh).pipe(takeUntil(this.onDestroy$)).subscribe(() => {

        });
      }

      this.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: r } });

      this.checkMallSchedule(r, this.delivered.toISOString()).then(bOnSchedule => {
        this.onSchedule = bOnSchedule;
        this.checkRange(r, () => {
          self.rx.dispatch({
            type: CommandActions.SEND,
            payload: { name: 'address-change', args: { address: self.deliveryAddress, inRange: self.inRange } }
          });
        });
      });
    }
  }

  onAddressBack(e) {
    const self = this;
    this.options = [];
    self.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'address-change', args: { address: self.deliveryAddress, inRange: self.inRange } }
    });
  }

  getSuggestLocationList(input: string, bShowList: boolean) {
    const self = this;
    this.locationSvc.reqPlaces(input).pipe(takeUntil(this.onDestroy$)).subscribe((ps: IPlace[]) => {
      if (ps && ps.length > 0) {
        const places = [];
        ps.map(p => {
          p.type = 'suggest';
          places.push(Object.assign({}, p));
        });

        self.suggestAddressList = places;
        if (bShowList) {
          self.options = places; // without lat lng
        }
      }
    });
  }

  cancel() {
    const self = this;
    const location = Cookies.get('duocun-old-location');
    if (!this.contact) {
      this.contact = new Contact();
      this.contact.accountId = self.account.id;
    }

    this.contact.location = (location && location !== 'undefined') ? JSON.parse(location) : null;

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE_LOCATION,
      payload: { location: this.contact.location }
    });

    this.rx.dispatch<IDeliveryAction>({
      type: DeliveryActions.UPDATE_ORIGIN,
      payload: { origin: this.contact.location }
    });

    Cookies.remove('duocun-old-location');
    if (self.fromPage === 'account-setting') {
      self.router.navigate(['account/setting']);
    } else if (self.fromPage === 'restaurant-detail') {
      self.router.navigate(['merchant/list/' + this.restaurant.id]);
    } else if (self.fromPage === 'contact-form') {
      self.router.navigate(['contact/form']);
    }
  }

  getDistance(ds: IDistance[], mall: IMall) {
    const d = ds.find(r => r.destinationPlaceId === mall.placeId);
    return d ? d.element.distance.value : 0;
  }

  updateDeliveryFee(restaurant, malls, mallId, ds: IDistance[]) {
    const self = this;
    const mall = malls.find(m => m.id === mallId); // restaurant.malls[0]); // fix me, get physical distance
    const distance = ds ? self.getDistance(ds, mall) : 0;
    restaurant.fullDeliveryFee = self.distanceSvc.getDeliveryCost(distance / 1000);
    restaurant.deliveryCost = self.distanceSvc.getDeliveryCost(distance / 1000);

    this.rx.dispatch({
      type: CartActions.UPDATE_DELIVERY, payload: {
        merchantId: restaurant.id,
        merchantName: restaurant.name,
        deliveryCost: restaurant.deliveryCost,
        deliveryDiscount: restaurant.deliveryCost
      }
    });
  }

  redirect(contact) {
    const self = this;
    if (self.fromPage === 'account-setting') {
      this.contactSvc.find({ accountId: contact.accountId }).pipe(takeUntil(this.onDestroy$)).subscribe((cs: IContact[]) => {
        if (cs && cs.length > 0) {
          const c = cs[0];
          const data = { address: contact.address, location: contact.location };
          this.contactSvc.update({ id: c.id }, data).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
            self.router.navigate(['account/setting']);
            self.snackBar.open('', '账号默认地址已成功修改。', { duration: 1500 });
          });
        } else {
          this.contactSvc.save(contact).subscribe(x => {
            self.router.navigate(['account/setting']);
            self.snackBar.open('', '账号默认地址已成功保存。', { duration: 1500 });
          });
        }
      });
    } else if (self.fromPage === 'restaurant-detail') {
      // update delivery fee and distances
      if (self.contact && self.contact.phone) {
        self.router.navigate(['order/form']);
      } else {
        self.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
      }
      self.snackBar.open('', '账号默认地址已成功保存。', { duration: 1500 });
    } else if (self.fromPage === 'contact-form') {
      self.router.navigate(['contact/form']);
      self.snackBar.open('', '账号默认地址已成功保存。', { duration: 1500 });
    } else if (self.fromPage === 'contact/address') {
      self.router.navigate(['contact/main'], { queryParams: { fromPage: 'address-form' } });
      self.snackBar.open('', '已成功保存。', { duration: 1500 });
    } else if (self.fromPage === 'contact/phone') {
      self.router.navigate(['contact/main'], { queryParams: { fromPage: 'phone-form' } });
      self.snackBar.open('', '已成功保存。', { duration: 1500 });
    } else {
      // self.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
    }
  }

  save() {
    const self = this;
    let restaurant;
    if (!this.contact) {
      this.contact = new Contact();
    }
    const contact = this.contact;
    contact.accountId = self.account.id;
    contact.username = self.account.username;
    contact.phone = self.contact ? self.contact.phone : '';
    contact.modified = new Date();
    contact.location = this.location;
    contact.address = this.deliveryAddress;

    // Cookies.remove('duocun-old-delivery-time');

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE_LOCATION,
      payload: { location: this.location }
    });

    this.rx.dispatch<IDeliveryAction>({
      type: DeliveryActions.UPDATE_ORIGIN,
      payload: { origin: this.location }
    });

    if (this.fromPage === 'account-setting') {
      this.redirect(contact);
    } else {
      // The order matters
      if (!self.inRange) {
        self.router.navigate(['main/home']);
        return;
      }

      if (!self.onSchedule) {
        this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: [] });
        alert('该餐馆今天休息，请选择其他餐馆');
        self.router.navigate(['main/home']);
        return;
      }

      // fix me!!!
      const mall = this.malls.find(m => m.id === this.restaurant.malls[0]);
      if (!this.mallSvc.isInRange(mall, this.availableRanges)) {
        alert('此餐馆不在配送范围内');
        return;
      }

      restaurant = this.restaurant;
      // this.mallSvc.find({ status: 'active' }).pipe(takeUntil(this.onDestroy$)).subscribe((malls: IMall[]) => {
      // this.realMalls = malls;
      // check if road distance in database
      const malls = this.malls;
      const q = { originPlaceId: self.location.placeId }; // origin --- client origin
      self.distanceSvc.find(q).pipe(takeUntil(self.onDestroy$)).subscribe((ds: IDistance[]) => {
        if (ds && ds.length > 0) {
          // const mall = malls.find(m => m.id === restaurant.malls[0]); // fix me, get physical distance
          self.updateDeliveryFee(restaurant, malls, restaurant.malls[0], ds);
          self.redirect(contact);
        } else {
          const destinations: ILocation[] = [];
          malls.map(m => {
            destinations.push({ lat: m.lat, lng: m.lng, placeId: m.placeId });
          });
          self.distanceSvc.reqRoadDistances(self.location, destinations).pipe(takeUntil(self.onDestroy$)).subscribe((rs: IDistance[]) => {
            if (rs) {
              self.updateDeliveryFee(restaurant, malls, restaurant.malls[0], rs);
              self.redirect(contact);
            }
          }, err => {
            console.log(err);
          });
        }
      });
      // });
    }
  }

  checkMallSchedule(origin: ILocation, delivered: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.mallSvc.getAvailables(origin, delivered).pipe(takeUntil(this.onDestroy$)).subscribe((ret: any) => {
        const malls = ret.mallIds;
        if (malls && malls.length > 0) {
          const mallId = malls.find(m => m === this.restaurant.mallId);
          resolve(mallId ? true : false);
        } else {
          resolve(false);
        }
      });
    });
  }

  checkRange(origin, cb) {
    const self = this;
    self.rangeSvc.find({ status: 'active' }).pipe(takeUntil(self.onDestroy$)).subscribe(ranges => {
      const rs = self.rangeSvc.getAvailableRanges({ lat: origin.lat, lng: origin.lng }, ranges);
      this.availableRanges = rs;
      self.inRange = (rs && rs.length > 0) ? true : false;

      // self.availableRanges = rs;
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
      if (cb) {
        cb();
      }
    });
  }

  resetAddress() {
    const self = this;
    this.deliveryAddress = '';
    this.inRange = true;
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'address-change', args: { address: self.deliveryAddress, inRange: self.inRange } }
    });
  }

}

