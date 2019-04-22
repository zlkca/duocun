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
import { IMall } from '../../mall/mall.model';
import { PageActions } from '../../main/main.actions';
import { IDeliveryTime } from '../../delivery/delivery.model';
import * as Cookies from 'js-cookie';
import { IDeliveryTimeAction } from '../../delivery/delivery-time.reducer';
import { DeliveryTimeActions } from '../../delivery/delivery-time.actions';
import { MatSnackBar } from '../../../../node_modules/@angular/material';

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
  bGettingCode = false;
  counter = 60;
  countDown;
  oldVerificationCode = '';

  onDestroy$ = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private contactSvc: ContactService,
    private rx: NgRedux<IAppState>,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      // username: [''],
      // phone: [''],
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
        // self.oldVerificationCode = contact.verificationCode;
        // contact.verificationCode = '';
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

  changeAddress() {
    this.router.navigate(['contact/address-form'], { queryParams: { fromPage: 'contact-form' }} );
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
      this.locationSvc.getHistoryLocations(this.account.id).pipe(
        takeUntil(this.onDestroy$)
      ).subscribe(a => {
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
    const self = this;
    if (e.target.value && e.target.value.length === 4) {
      const code = e.target.value;
      this.contactSvc.verifyCode(code, this.account.id).subscribe(verified => {
        this.phoneVerified = verified;
        if (verified) {
          if (self.countDown) {
            clearInterval(self.countDown);
          }
        }
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
    v.placeId = this.contact.location.placeId;
    v.location = this.contact.location;
    v.address = this.deliveryAddress;
    // v.verificationCode = this.oldVerificationCode;
    return new Contact(v);
  }

  save() {
    const self = this;
    // if (!this.phoneVerified) {
    //   return;
    // }

    const contact = this.getContact();

    Cookies.remove('duocun-old-delivery-time');

    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE,
      payload: contact
    });

    self.router.navigate(['contact/list']);

    // if (contact.id) {
    //   this.contactSvc.replace(contact).subscribe(x => {
    //     self.router.navigate(['contact/list']);
    //   }, err => {
    //     self.router.navigate(['contact/list']);
    //   });
    // } else {
    //   this.contactSvc.save(contact).subscribe(x => {
    //     self.router.navigate(['contact/list']);
    //   }, err => {
    //     self.router.navigate(['contact/list']);
    //   });
    // }
  }

  sendVerify() {
    const self = this;
    let phone: string = this.form.value.phone;

    if (phone) {
      phone = phone.match(/\d+/g).join('');
      this.contact.phone = phone;
      this.bGettingCode = true;
      this.counter = 60;
      this.countDown = setInterval(function () {
        self.counter--;
        if (self.counter === 0) {
          clearInterval(self.countDown);
          self.bGettingCode = false;
        }
      }, 1000);
      this.contactSvc.sendVerifyMessage(this.contact).subscribe(x => {
        this.snackBar.open('', '短信验证码已发送', {
          duration: 1000
        });
      });
    }
  }
  // verify(code: string, accountId: string) {
  //   const v = this.form.value;
  //   this.contactSvc.verifyCode(code, accountId).subscribe(x => {
  //     this.phoneVerified = x;
  //   });
  // }
}
