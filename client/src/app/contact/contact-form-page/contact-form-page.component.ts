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
import { ICommand, ICommandAction } from '../../shared/command.reducers';
import { PageActions } from '../../main/main.actions';
import { IDeliveryTime } from '../../delivery/delivery.model';
import { CommandActions } from '../../shared/command.actions';
import * as Cookies from 'js-cookie';
import { IDeliveryTimeAction } from '../../delivery/delivery-time.reducer';
import { DeliveryTimeActions } from '../../delivery/delivery-time.actions';
import { CodegenComponentFactoryResolver } from '../../../../node_modules/@angular/core/src/linker/component_factory_resolver';

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
  bDeliveryTime = false;
  deliveryTime: IDeliveryTime = null;
  oldDeliveryTime: IDeliveryTime = null;
  phoneVerified = true;

  onDestroy$ = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private contactSvc: ContactService,
    private rx: NgRedux<IAppState>,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: [''],
      phone: [''],
      verificationCode: [''],
      unit: [''],
      buzzCode: ['']
    });

    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'contact-form'
    });
  }

  ngOnInit() {
    const self = this;
    const s = Cookies.get('duocun-old-delivery-time');
    this.oldDeliveryTime = s ? JSON.parse(s) : null;

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
        if (!contact.phone) {
          this.phoneVerified = false;
        }
        this.form.patchValue(contact);
        this.deliveryAddress = this.contact.address;
      }
    });

    this.rx.select('deliveryTime').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((t: IDeliveryTime) => {
      if (!this.oldDeliveryTime) {
        this.oldDeliveryTime = t;
        Cookies.set('duocun-old-delivery-time', JSON.stringify(t));
      }
      this.deliveryTime = t;
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
      this.rx.dispatch<ILocationAction>({
        type: LocationActions.UPDATE,
        payload: r
      });
      this.contact.location = r;
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

  onDateChange(e) {
    this.bDeliveryTime = false;
    if (e) {

    }
    // const self = this;
    // this.options = [];
    // this.locationSvc.reqPlaces(e.input).subscribe((ps: IPlace[]) => {
    //   if (ps && ps.length > 0) {
    //     for (const p of ps) {
    //       p.type = 'suggest';
    //       self.options.push(p); // without lat lng
    //     }
    //   }
    // });
  }

  onDateClear(e) {
    // this.deliveryAddress = '';
    // this.options = [];
    // this.onAddressInputFocus();
  }

  onDateInputFocus(e?: any) {
    this.bDeliveryTime = true;
  }

  onSelectDeliveryTime(e: IDeliveryTime) {
    if (e) {
      this.deliveryTime = e;
    }
  }

  onPhoneChange(e) {
    this.phoneVerified = false;
  }

  onVerificationCodeInput(e) {
    if (e.target.value && e.target.value.length === 4) {
      const code = e.target.value;
      this.contactSvc.verifyCode(code, this.account.id).subscribe(x => {
        this.phoneVerified = x;
      });
    }
  }

  changeDeliveryDate() {
    this.router.navigate(['contact/delivery-date']);
  }

  cancel() {
    const self = this;
    this.rx.dispatch<IDeliveryTimeAction>({
      type: DeliveryTimeActions.UPDATE,
      payload: this.oldDeliveryTime
    });
    Cookies.remove('duocun-old-delivery-time');
    self.router.navigate(['contact/list']);
  }

  getContact() {
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
    return new Contact(v);
  }

  save() {
    const self = this;
    if (!this.phoneVerified) {
      return;
    }

    const contact = this.getContact();

    Cookies.remove('duocun-old-delivery-time');

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

    if (contact.id) {
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

  sendVerify() {
    const contact = this.getContact();
    contact.phone = contact.phone.match(/\d+/g).join('');

    if (contact.phone) {
      this.contactSvc.sendVerifyMessage(contact).subscribe(x => {

      });
    }
  }

  verify(code: string, accountId: string) {
    const v = this.form.value;
    this.contactSvc.verifyCode(code, accountId).subscribe(x => {
      this.phoneVerified = x;
    });
  }
}
