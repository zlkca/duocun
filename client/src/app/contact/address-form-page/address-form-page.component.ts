import { Component, OnInit, OnDestroy } from '@angular/core';
import { IPlace, ILocation, ILocationHistory, IDistance } from '../../location/location.model';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { PageActions } from '../../main/main.actions';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import * as Cookies from 'js-cookie';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { IDeliveryAction } from '../../delivery/delivery.reducer';
import { IMerchant } from '../../merchant/merchant.model';
import { IMall } from '../../mall/mall.model';
import { IRange } from '../../range/range.model';
import { CommandActions } from '../../shared/command.actions';
import { IAccount } from '../../account/account.model';
import { environment } from '../../../environments/environment';

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
  fromPage;
  form;
  onDestroy$ = new Subject<any>();
  inRange = true;
  mapRanges = [];
  mapZoom = 14;
  rangeMap = false;
  mapCenter;
  suggestAddressList;
  historyAddressList;
  bUpdateLocationList = true;
  malls: IMall[];
  availableRanges: IRange[];
  lang = environment.language;
  onSchedule;

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
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
  }

  ngOnInit() {
    const self = this;

    this.accountSvc.getCurrentAccount().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      const accountId: string = account._id;
      self.account = account;

      self.locationSvc.find({ accountId: accountId }).pipe(takeUntil(this.onDestroy$)).subscribe((lhs: ILocationHistory[]) => {
        const a = self.locationSvc.toPlaces(lhs);
        self.historyAddressList = a;
      });
    });
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

    this.options = [];
    if (origin) {
      this.location = origin;
      this.deliveryAddress = this.locationSvc.getAddrString(origin);
      if (this.account) {
        const accountId = this.account._id;
        const accountName = this.account.username;
        const query = { accountId: accountId, placeId: origin.placeId };
        const lh = { accountId: accountId, accountName: accountName, placeId: origin.placeId, location: origin };

        this.locationSvc.upsertOne(query, lh).pipe(takeUntil(this.onDestroy$)).subscribe(() => {

        });
      }

      this.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: origin } });
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

  getDistance(ds: IDistance[], mall: IMall) {
    const d = ds.find(r => r.destinationPlaceId === mall.placeId);
    return d ? d.element.distance.value : 0;
  }

  onCancel() {
    const self = this;
    const location = Cookies.get('duocun-old-location');
    const oldLocation = (location && location !== 'undefined') ? JSON.parse(location) : null;

    this.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: oldLocation }});

    Cookies.remove('duocun-old-location');
    if (self.fromPage === 'account-setting') {
      self.router.navigate(['account/settings']);
    }
  }

  onSave() {
    const self = this;
    const accountId = this.account._id;
    const location = this.location;
    const hint = this.lang === 'en' ? 'Change default address successfully' : '账号默认地址已成功修改';
    this.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: location }});

    const data = { location: location ? location : '' };
    this.accountSvc.update({ _id: accountId }, data).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      self.router.navigate(['account/settings']);
      self.snackBar.open('', hint, { duration: 1500 });
      this.rx.dispatch({ type: CommandActions.CLEAR_CMD, payload: {} });
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

