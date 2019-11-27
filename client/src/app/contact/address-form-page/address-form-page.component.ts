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
import { IAccount } from '../../account/account.model';

@Component({
  selector: 'app-address-form-page',
  templateUrl: './address-form-page.component.html',
  styleUrls: ['./address-form-page.component.scss']
})
export class AddressFormPageComponent implements OnInit, OnDestroy {
  options;
  location; // onSelect from list
  deliveryAddress;
  account: IAccount;
  contact: Contact;
  fromPage;
  form;
  onDestroy$ = new Subject<any>();
  inRange = true;
  mapRanges = [];
  mapZoom = 14;
  rangeMap = false;
  mapCenter;
  restaurant;
  suggestAddressList;
  historyAddressList;
  bUpdateLocationList = true;
  malls: IMall[];
  availableRanges: IRange[];
  // delivered; // moment object
  onSchedule;

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private contactSvc: ContactService,
    // private rangeSvc: RangeService,
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

    this.accountSvc.getCurrent().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      const accountId: string = account._id;
      self.account = account;

      self.locationSvc.find({ accountId: accountId }).pipe(takeUntil(this.onDestroy$)).subscribe((lhs: ILocationHistory[]) => {
        const a = self.locationSvc.toPlaces(lhs);
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

    // this.rx.select('delivery').pipe(takeUntil(this.onDestroy$)).subscribe((r: IDelivery) => {
    //   this.delivered = r.date;
    // });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }


  onAddressChange(e) {
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
    if (this.account) {
      if (e.input) {
        this.options = this.suggestAddressList;
      } else {
        this.options = this.historyAddressList.map(x => Object.assign({}, x));
      }
    }
  }

  onSelectPlace(e) {
    const origin: ILocation = e.location;
    const accountId = this.account._id;
    const accountName = this.account.username;

    this.options = [];
    if (origin) {
      this.location = origin;
      this.deliveryAddress = this.locationSvc.getAddrString(origin);
      if (this.account) {
        const query = { accountId: accountId, placeId: origin.placeId };
        const lh = { accountId: accountId, accountName: accountName, placeId: origin.placeId, location: origin };

        this.locationSvc.upsertOne(query, lh).pipe(takeUntil(this.onDestroy$)).subscribe(() => {

        });
      }

      this.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: origin } });

      // this.checkMallSchedule(origin, this.delivered.toISOString()).then(bOnSchedule => {
      //   this.onSchedule = bOnSchedule;

      //   this.rangeSvc.find({ status: 'active' }).pipe(takeUntil(this.onDestroy$)).subscribe((rs: IRange[]) => {
      //     const ranges: IRange[] = [];
      //     rs.map((r: IRange) => {
      //       if (this.locationSvc.getDirectDistance(origin, {lat: r.lat, lng: r.lng}) < r.radius) {
      //         ranges.push(r);
      //       }
      //     });

      //     // this.rangeSvc.findAvailables(origin).pipe(takeUntil(this.onDestroy$)).subscribe((ranges: IRange[]) => {

      //     this.inRange = (ranges && ranges.length > 0) ? true : false;
      //     this.mapRanges = rs;
      //     if (this.inRange) {
      //       self.mapZoom = 14;
      //       self.mapCenter = origin;
      //     } else {
      //       self.mapZoom = 9;
      //       const farNorth = { lat: 44.2653618, lng: -79.4191007 };
      //       self.mapCenter = {
      //         lat: (origin.lat + farNorth.lat) / 2,
      //         lng: (origin.lng + farNorth.lng) / 2
      //       };
      //     }
      //     // this.address = origin; // order matters

      //     self.rx.dispatch({
      //       type: CommandActions.SEND,
      //       payload: { name: 'address-change', args: { address: self.deliveryAddress, inRange: this.inRange } }
      //     });
      //   });
      // });
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
          const contactId = cs[0]._id;
          const data = { address: contact.address, location: contact.location };
          this.contactSvc.update({ _id: contactId }, data).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
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
    } else if (self.fromPage === 'restaurant-detail') { // will no longer go here any more
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
    // } else if (self.fromPage === 'contact/address') {
    //   self.router.navigate(['contact/main'], { queryParams: { fromPage: 'address-form' } });
    //   self.snackBar.open('', '已成功保存。', { duration: 1500 });
    // } else if (self.fromPage === 'contact/phone') {
    //   self.router.navigate(['contact/main'], { queryParams: { fromPage: 'phone-form' } });
    //   self.snackBar.open('', '已成功保存。', { duration: 1500 });
    } else {
      // self.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'restaurant-detail' } });
    }
  }

  save() {
    const self = this;
    const accountId = this.account._id;
    const accountName = this.account.username;
    const address = this.deliveryAddress;
    const location = this.location;

    const contact: any = {
      accountId: accountId,
      username: accountName,
      phone: this.contact ? this.contact.phone : '',
      location: location,
      address: address
    };

    if (this.contact) {
      contact._id = this.contact._id;
    }
    // Cookies.remove('duocun-old-delivery-time');

    this.rx.dispatch<IContactAction>({ type: ContactActions.UPDATE_LOCATION, payload: { location: location } });
    this.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: location }});

    if (this.fromPage === 'account-setting') {
      this.contactSvc.find({ accountId: contact.accountId }).pipe(takeUntil(this.onDestroy$)).subscribe((cs: IContact[]) => {
        if (cs && cs.length > 0) {
          const contactId = cs[0]._id;
          const data = { address: address, location: location };
          this.contactSvc.update({ _id: contactId }, data).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
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

      self.redirect(contact);
      // this.mallSvc.find({ status: 'active' }).pipe(takeUntil(this.onDestroy$)).subscribe((malls: IMall[]) => {
      // this.realMalls = malls;
      // check if road distance in database
      // const malls = this.malls;
      // const q = { originPlaceId: self.location.placeId }; // origin --- client origin

      // self.distanceSvc.find(q).pipe(takeUntil(self.onDestroy$)).subscribe((ds: IDistance[]) => {
      //   if (ds && ds.length > 0) {
      //     // const mall = malls.find(m => m.id === restaurant.malls[0]); // fix me, get physical distance
      //     // self.updateDeliveryFee(restaurant, malls, restaurant.malls[0], ds);
      //     self.redirect(contact);
      //   } else {
      //     const destinations: ILocation[] = [];
      //     malls.map(m => {
      //       destinations.push({ lat: m.lat, lng: m.lng, placeId: m.placeId });
      //     });
      //     self.distanceSvc.reqRoadDistances(self.location, destinations)
      //        .pipe(takeUntil(self.onDestroy$)).subscribe((rs: IDistance[]) => {
      //       if (rs) {
      //         // self.updateDeliveryFee(restaurant, malls, restaurant.malls[0], rs);
      //         self.redirect(contact);
      //       }
      //     }, err => {
      //       console.log(err);
      //     });
      //   }
      // });
      // });
    }
  }

  // checkMallSchedule(origin: ILocation, delivered: string): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     this.mallSvc.getAvailables(origin, delivered).pipe(takeUntil(this.onDestroy$)).subscribe((ret: any) => {
  //       const malls = ret.mallIds;
  //       if (malls && malls.length > 0) {
  //         const mallId = malls.find(m => m === this.restaurant.mallId);
  //         resolve(mallId ? true : false);
  //       } else {
  //         resolve(false);
  //       }
  //     });
  //   });
  // }

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

