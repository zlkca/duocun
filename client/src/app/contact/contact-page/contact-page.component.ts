import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '../../../../node_modules/@angular/router';
import { FormGroup, FormBuilder, Validators } from '../../../../node_modules/@angular/forms';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { IContact } from '../contact.model';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss']
})
export class ContactPageComponent implements OnInit, OnDestroy {
  form;
  isLinear = false;
  addressForm: FormGroup;
  secondFormGroup: FormGroup;

  places;
  bUpdateLocationList;
  suggestAddressList;
  historyAddressList;
  deliveryAddress;
  onDestroy$ = new Subject<any>();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private rx: NgRedux<IAppState>,
  ) { }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.addressForm = this.fb.group({
      address: ['', Validators.required]
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });


    this.rx.select('contact').pipe(takeUntil(this.onDestroy$)).subscribe((contact: IContact) => {
      if (contact) {
        this.addressForm.get('address').patchValue(contact.address);
      }
    });
  }

  onPhoneChange(e) {
    this.router.navigate(['contact/phone-form']);
  }

  onAddressChange(e) {
    this.router.navigate(['contact/address-form']);
  }

  cancel() {

  }

  save() {

  }

  toAddressEdit() {
    this.router.navigate(['contact/address-form'], { queryParams: { fromPage: 'contact/address' } });
  }

  toPhoneEdit() {
    this.router.navigate(['contact/phone-form'], { queryParams: { fromPage: 'contact/address' } });
  }
}
