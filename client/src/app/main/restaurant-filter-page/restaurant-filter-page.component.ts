import { Component, OnInit, OnDestroy } from '@angular/core';
import { IDeliveryTime } from '../../delivery/delivery.model';
import { Subject } from '../../../../node_modules/rxjs';
import { Router } from '../../../../node_modules/@angular/router';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../main.actions';
import { takeUntil, take } from '../../../../node_modules/rxjs/operators';
import { IDeliveryTimeAction } from '../../delivery/delivery-time.reducer';
import { DeliveryTimeActions } from '../../delivery/delivery-time.actions';
import { ILocation, IPlace } from '../../location/location.model';
import { MallService } from '../../mall/mall.service';
import { AccountService } from '../../account/account.service';
import { LocationService } from '../../location/location.service';
import { ILocationAction } from '../../location/location.reducer';
import { LocationActions } from '../../location/location.actions';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-restaurant-filter-page',
  templateUrl: './restaurant-filter-page.component.html',
  styleUrls: ['./restaurant-filter-page.component.scss']
})
export class RestaurantFilterPageComponent implements OnInit, OnDestroy {

  deliveryTime: IDeliveryTime = { type: '', text: '' };
  deliveryDiscount = 2;
  orderDeadline = { h: 9, m: 30 };

  location: ILocation;
  places: IPlace[] = [];
  inRange = false;
  onDestroy$ = new Subject<any>();
  today;
  overdue = false;
  deliveryAddress;

  account;

  constructor(
    private router: Router,
    private accountSvc: AccountService,
    private mallSvc: MallService,
    private locationSvc: LocationService,
    private sharedSvc: SharedService,
    private rx: NgRedux<IAppState>
  ) {
    const self = this;
    const today = this.sharedSvc.getTodayString();
    this.today = {type: 'lunch today', text: '今天午餐', date: today, startTime: '11:45', endTime: '13:30'};
    this.overdue = this.sharedSvc.isOverdue(this.orderDeadline.h, this.orderDeadline.m);

    this.accountSvc.getCurrent().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(account => {
      self.account = account;
    });
  }

  ngOnInit() {
    const self = this;
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'restaurant-filter'
    });

    this.rx.select('deliveryTime').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((t: IDeliveryTime) => {
      self.deliveryTime = t;
    });

    this.rx.select('location').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((loc: ILocation) => {
      if (loc) {
        self.location = loc;
        self.deliveryAddress = self.locationSvc.getAddrString(loc);
        self.inRange = self.mallSvc.inRange(loc);
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
  onSelectDeliveryTime(e: IDeliveryTime) {
    const self = this;
    const r = self.location;
    if (e) {
      this.deliveryTime = e;
      this.rx.dispatch<IDeliveryTimeAction>({
        type: DeliveryTimeActions.UPDATE,
        payload: e
      });
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
      this.router.navigate(['restaurant/list']);
    }
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
    }
  }

  onAddressChange(e) {
    const self = this;
    this.places = [];
    this.locationSvc.reqPlaces(e.input).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((ps: IPlace[]) => {
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
    },
      err => {
        console.log(err);
      });
  }

  showLocationList() {
    return this.places && this.places.length > 0;
  }

  changeAddress() {
    this.router.navigate(['contact/address-form'], { queryParams: { fromPage: 'restaurant-filter' }});
  }
}
