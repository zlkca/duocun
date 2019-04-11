import { Component, OnInit, OnDestroy } from '@angular/core';
import { IPlace, ILocation } from '../../location/location.model';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { ILocationAction } from '../../location/location.reducer';
import { LocationActions } from '../../location/location.actions';
import { PageActions } from '../../main/main.actions';
import { IContact, Contact } from '../contact.model';
import { IContactAction } from '../contact.reducer';
import { ContactActions } from '../contact.actions';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { MatSnackBar } from '../../../../node_modules/@angular/material';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { ContactService } from '../contact.service';
import { LocationService } from '../../location/location.service';
import { AccountService } from '../../account/account.service';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import * as Cookies from 'js-cookie';

@Component({
  selector: 'app-address-form-page',
  templateUrl: './address-form-page.component.html',
  styleUrls: ['./address-form-page.component.scss']
})
export class AddressFormPageComponent implements OnInit, OnDestroy {
  options;
  location;
  deliveryAddress;
  account;
  contact: Contact;
  fromPage;
  form;
  onDestroy$ = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private contactSvc: ContactService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.fromPage = this.route.snapshot.queryParamMap.get('fromPage');

    this.form = this.fb.group({
      verificationCode: [''],
    });

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'address-form'
    });
  }

  ngOnInit() {
    const self = this;

    this.accountSvc.getCurrent().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(account => {
      self.account = account;
    });

    this.rx.select('contact').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((r: IContact) => {
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
    this.locationSvc.reqPlaces(e.input).subscribe((ps: IPlace[]) => {
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
    this.onAddressInputFocus();
  }

  onAddressInputFocus(e?: any) {
    const self = this;
    this.options = [];
    if (this.account && this.account.id) {
      this.locationSvc.getHistoryLocations(this.account.id).then(a => {
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
        const query = { where: { userId: self.account.id, placeId: r.place_id } };
        const lh = {
          userId: self.account.id, type: 'history',
          placeId: r.place_id, location: r, created: new Date()
        };
        self.locationSvc.saveIfNot(query, lh).pipe(
          takeUntil(this.onDestroy$)
        ).subscribe(() => {

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

    this.contact.location = location ? JSON.parse(location) : null;

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE,
      payload: this.contact
    });

    Cookies.remove('duocun-old-location');
    if (self.fromPage === 'account-setting') {
      self.router.navigate(['account/setting']);
    } else if (self.fromPage === 'restaurant-detail') {
      self.router.navigate(['contact/list']);
    }
  }

  save() {
    const self = this;
    if (!this.contact) {
      this.contact = new Contact();
    }
    const contact = this.contact;
    contact.accountId = self.account.id;
    contact.location = this.location;
    contact.address = this.deliveryAddress;
    contact.modified = new Date();
    // Cookies.remove('duocun-old-delivery-time');

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE,
      payload: contact
    });

    // this.rx.dispatch<ILocationAction>({
    //   type: LocationActions.UPDATE,
    //   payload: this.location
    // });

    if (contact.id) {
      this.contactSvc.replace(contact).subscribe(x => {
        if (self.fromPage === 'account-setting') {
          self.router.navigate(['account/setting']);
        } else if (self.fromPage === 'restaurant-detail') {
          self.router.navigate(['contact/list']);
        }
      });
    } else {
      this.contactSvc.save(contact).subscribe(x => {
        if (self.fromPage === 'account-setting') {
          self.router.navigate(['account/setting']);
        } else if (self.fromPage === 'restaurant-detail') {
          self.router.navigate(['contact/list']);
        }
      });
    }
  }

}
