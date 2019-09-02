import { Component, OnInit, OnDestroy } from '@angular/core';
import { IPlace, ILocation, ILocationHistory } from '../../location/location.model';
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
import * as Cookies from 'js-cookie';
import { MatSnackBar } from '../../../../node_modules/@angular/material';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss']
})
export class AddressFormComponent implements OnInit, OnDestroy {
  options;
  location;
  deliveryAddress;
  account;
  contact: Contact;
  fromPage;
  form;
  onDestroy$ = new Subject<any>();

  constructor(
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private contactSvc: ContactService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.fromPage = this.route.snapshot.queryParamMap.get('fromPage');

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: {name: 'address-form'}
    });
  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrent().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
      self.account = account;
      if (this.account && this.account.id) {
        // load location option list
        this.locationSvc.find({ userId: this.account.id }).pipe(takeUntil(this.onDestroy$)).subscribe((lhs: ILocationHistory[]) => {
          const a = this.locationSvc.toPlaces(lhs);
          self.options = a;
        });
      } else {
        self.options = [];
      }
    });

    this.rx.select('contact').pipe(takeUntil(this.onDestroy$)).subscribe((r: IContact) => {
      if (r) {
        self.contact = new Contact(r);
        self.deliveryAddress = this.contact.address;
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onAddressChange(e) {
    const self = this;
    this.options = [];
    this.locationSvc.reqPlaces(e.input).pipe(takeUntil(this.onDestroy$)).subscribe((ps: IPlace[]) => {
      if (ps && ps.length > 0) {
        for (const p of ps) {
          p.type = 'suggest';
          self.options.push(p); // without lat lng
        }
      }
    });
  }

  onAddressClear(e) {
    this.deliveryAddress = '';
    this.options = [];
    this.onAddressInputFocus({ input: '' });
  }

  onAddressInputFocus(e?: any) {
    const self = this;
    this.options = [];
    if (this.account && this.account.id) {
      this.locationSvc.find({ userId: this.account.id }).pipe(takeUntil(this.onDestroy$)).subscribe((lhs: ILocationHistory[]) => {
        const a = this.locationSvc.toPlaces(lhs);
        self.options = a;
      });
    }
  }

  onSelectPlace(e) {
    const self = this;
    const r: ILocation = e.location;
    this.options = [];
    if (r) {
      this.location = r;
      this.deliveryAddress = e.address; // set address text to input
      if (self.account) {
        const query = { userId: self.account.id, placeId: r.placeId };
        const lh = {
          userId: self.account.id, accountName: self.account.username, type: 'history',
          placeId: r.placeId, location: r, created: new Date()
        };
        self.locationSvc.saveIfNot(query, lh).pipe(takeUntil(this.onDestroy$)).subscribe(() => {

        });
      }
    }
  }

  cancel() {
    const self = this;
    const location = Cookies.get('duocun-old-location');
    if (!this.contact) {
      this.contact = new Contact();
      this.contact.accountId = self.account.id;
    }

    this.contact.location = (location !== 'undefined') ? JSON.parse(location) : null;

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE_LOCATION,
      payload: { location: this.contact.location }
    });

    Cookies.remove('duocun-old-location');
    if (self.fromPage === 'account-setting') {
      self.router.navigate(['account/setting']);
    } else if (self.fromPage === 'restaurant-detail') {
      self.router.navigate(['contact/list']);
    } else if (self.fromPage === 'contact-form') {
      self.router.navigate(['contact/form']);
    }
  }

  save() {
    const self = this;
    if (!this.contact) {
      this.contact = new Contact();
    }
    const contact = this.contact;
    contact.accountId = self.account.id;
    contact.username = self.account.username;
    contact.location = this.location;
    contact.address = this.deliveryAddress;
    contact.phone = self.contact ? self.contact.phone : '';
    contact.modified = new Date();
    // Cookies.remove('duocun-old-delivery-time');

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE_LOCATION,
      payload: { location: this.location }
    });

    if (self.fromPage === 'account-setting') {
      if (contact.id) {
        this.contactSvc.replace(contact).subscribe(x => {
          self.router.navigate(['account/setting']);
          self.snackBar.open('', '账号默认地址已成功修改。', { duration: 1500 });
        });
      } else {
        this.contactSvc.save(contact).subscribe(x => {
          self.router.navigate(['account/setting']);
          self.snackBar.open('', '账号默认地址已成功保存。', { duration: 1500 });
        });
      }
    } else if (self.fromPage === 'restaurant-detail') {
      self.router.navigate(['contact/list']);
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
    }

  }

}
