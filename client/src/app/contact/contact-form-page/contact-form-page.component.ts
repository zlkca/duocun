import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { LocationService } from '../../location/location.service';
import { ILocation, ILocationHistory, IPlace } from '../../location/location.model';
import { ILocationAction } from '../../location/location.reducer';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { LocationActions } from '../../location/location.actions';
import { takeUntil, take } from '../../../../node_modules/rxjs/operators';
import { AccountService } from '../../account/account.service';
import { Subject } from '../../../../node_modules/rxjs';
import { Router } from '../../../../node_modules/@angular/router';
import { ContactService } from '../contact.service';
import { Contact, IContact } from '../contact.model';
import { ContactActions } from '../contact.actions';
import { IContactAction } from '../contact.reducer';
// import { MallService } from '../../mall/mall.service';
import { IMall } from '../../mall/mall.model';
// import { MallActions } from '../../mall/mall.actions';

@Component({
  selector: 'app-contact-form-page',
  templateUrl: './contact-form-page.component.html',
  styleUrls: ['./contact-form-page.component.scss']
})
export class ContactFormPageComponent implements OnInit, OnDestroy {
  form;
  account;
  options = [];
  contact: IContact;
  deliveryAddress: string;
  malls: IMall[];
  // deliverTimeType: string;

  onDestroy$ = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private contactSvc: ContactService,
    // private mallSvc: MallService,
    private rx: NgRedux<IAppState>,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: [''],
      phone: [''],
      unit: [''],
      buzzCode: ['']
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
    ).subscribe((contact: IContact) => {
      if (contact) {
        this.contact = contact;
        this.form.patchValue(contact);
        this.deliveryAddress = this.contact.address;
      }
    });

    // this.rx.select<string>('deliverTime').pipe(
    //   takeUntil(this.onDestroy$)
    // ).subscribe(timeType => {
    //   self.deliverTimeType = timeType;
    // });
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
      this.locationSvc.find({ where: { userId: this.account.id } }).subscribe((lhs: ILocationHistory[]) => {
        const options = [];
        for (let i = lhs.length - 1; i >= 0; i--) {
          const lh = lhs[i];
          const loc = lh.location;
          const p: IPlace = {
            type: 'history',
            structured_formatting: {
              main_text: loc.street_number + ' ' + loc.street_name,
              secondary_text: (loc.sub_locality ? loc.sub_locality : loc.city) + ',' + loc.province
            },
            location: loc
          };
          options.push(p);
        }
        self.options = options;
      });
    }
  }

  onSelectPlace(e) {
    const r: ILocation = e.location;
    this.options = [];
    if (r) {
      this.rx.dispatch<ILocationAction>({
        type: LocationActions.UPDATE,
        payload: r
      });
      this.contact.location = r;
      this.deliveryAddress = e.address; // set address text to input
    }
  }

  save() {
    const self = this;
    const v = this.form.value;
    if (this.contact.id) {
      v.id = this.contact.id;
      v.created = this.contact.created;
    } else {
      v.created = new Date();
    }
    v.modified = new Date();
    v.accountId = this.account.id;
    v.placeId = this.contact.location.place_id;
    v.location = this.contact.location;
    v.address = this.deliveryAddress;
    const contact = new Contact(v);

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE,
      payload: contact
    });

    // self.mallSvc.calcMalls({ lat: v.location.lat, lng: v.location.lng }, self.deliverTimeType).then((malls: IMall[]) => {
    //   self.malls = malls;
    //   self.rx.dispatch({
    //     type: MallActions.UPDATE,
    //     payload: self.malls.filter(r => r.type === 'real')
    //   });
    // });

    if (v.id) {
      this.contactSvc.replace(contact).subscribe(x => {
        self.router.navigate(['contact/list']);
      }, err => {
        self.router.navigate(['contact/list']);
      });
    } else {
      this.contactSvc.save(contact).subscribe(x => {
        self.router.navigate(['contact/list']);
      }, err => {
        self.router.navigate(['contact/list']);
      });
    }
  }
}
