import { Component, OnInit } from '@angular/core';
import { IDeliveryTime } from '../../delivery/delivery.model';
import { Subject } from '../../../../node_modules/rxjs';
import { Router } from '../../../../node_modules/@angular/router';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../main.actions';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { IDeliveryTimeAction } from '../../delivery/delivery-time.reducer';
import { DeliveryTimeActions } from '../../delivery/delivery-time.actions';
import { ILocation, IPlace } from '../../location/location.model';
import { MallService } from '../../mall/mall.service';
import { AccountService } from '../../account/account.service';
import { LocationService } from '../../location/location.service';
import { ILocationAction } from '../../location/location.reducer';
import { LocationActions } from '../../location/location.actions';

@Component({
  selector: 'app-restaurant-filter-page',
  templateUrl: './restaurant-filter-page.component.html',
  styleUrls: ['./restaurant-filter-page.component.scss']
})
export class RestaurantFilterPageComponent implements OnInit {

  deliveryTime: IDeliveryTime = { type: '', text: '' };
  deliveryDiscount = 2;
  orderDeadline = { h: 9, m: 30 };

  location: ILocation;
  places: IPlace[] = [];
  inRange = false;
  onDestroy$ = new Subject<any>();

  deliveryAddress;

  account;

  constructor(
    private router: Router,
    private accountSvc: AccountService,
    private mallSvc: MallService,
    private locationSvc: LocationService,
    private rx: NgRedux<IAppState>
  ) {
    const self = this;
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

  onSelectDeliveryTime(e: IDeliveryTime) {
    if (e) {
      this.deliveryTime = e;
      this.rx.dispatch<IDeliveryTimeAction>({
        type: DeliveryTimeActions.UPDATE,
        payload: e
      });

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
      // self.sharedSvc.emitMsg({name: 'OnUpdateAddress', addr: r});
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
