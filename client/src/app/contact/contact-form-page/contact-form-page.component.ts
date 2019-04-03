import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '../../../../node_modules/@angular/forms';
import { LocationService } from '../../location/location.service';
import { ILocation, ILocationHistory, IPlace } from '../../location/location.model';
import { ILocationAction } from '../../location/location.reducer';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { LocationActions } from '../../location/location.actions';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { AccountService } from '../../account/account.service';
import { Subject } from '../../../../node_modules/rxjs';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-contact-form-page',
  templateUrl: './contact-form-page.component.html',
  styleUrls: ['./contact-form-page.component.scss']
})
export class ContactFormPageComponent implements OnInit, OnDestroy {
  form;
  deliveryAddress;
  account;
  options = [];
  onDestroy$ = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private accountSvc: AccountService,
    private locationSvc: LocationService,
    private rx: NgRedux<IAppState>,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: [''],
      phone: ['']
    });
  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrent().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(account => {
      self.account = account;
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
  }

  onAddressInputFocus(e) {
    const self = this;
    this.options = [];
    if (this.account && this.account.id) {
      this.locationSvc.find({ where: { userId: this.account.id } }).subscribe((lhs: ILocationHistory[]) => {
        const options = [];
        for (const lh of lhs) {
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
    const r = e.location;
    this.options = [];
    if (r) {
      this.rx.dispatch<ILocationAction>({
        type: LocationActions.UPDATE,
        payload: r
      });
      // this.center = { lat: r.lat, lng: r.lng };
      // this.calcDistancesToMalls({ lat: r.lat, lng: r.lng });
      this.deliveryAddress = e.address; // set address text to input
    }
  }

  save() {
    this.router.navigate(['contact/list']);
  }
}
