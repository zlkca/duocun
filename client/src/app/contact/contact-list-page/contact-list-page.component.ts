import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactService } from '../contact.service';
import { Subject, forkJoin } from 'rxjs';
import { IAppState } from '../../store';
import { NgRedux } from '@angular-redux/store';
import { takeUntil, first } from '../../../../node_modules/rxjs/operators';
import { IContact } from '../contact.model';
import { IAccount } from '../../account/account.model';
import { ILocation } from '../../location/location.model';
import { Router } from '../../../../node_modules/@angular/router';
import { ContactActions } from '../contact.actions';
import { PageActions } from '../../main/main.actions';
import { SharedService } from '../../shared/shared.service';
import { MallService } from '../../mall/mall.service';
import { IMall } from '../../mall/mall.model';
import { MallActions } from '../../mall/mall.actions';
import { IDeliveryTime } from '../../delivery/delivery.model';
import { LocationService } from '../../location/location.service';

@Component({
  selector: 'app-contact-list-page',
  templateUrl: './contact-list-page.component.html',
  styleUrls: ['./contact-list-page.component.scss']
})
export class ContactListPageComponent implements OnInit, OnDestroy {

  items: IContact[];
  location: ILocation;
  malls: IMall[];
  deliverTimeType: string;
  deliverTime: IDeliveryTime;

  private onDestroy$ = new Subject<any>();
  constructor(
    private contactSvc: ContactService,
    private locationSvc: LocationService,
    private mallSvc: MallService,
    private rx: NgRedux<IAppState>,
    private router: Router
  ) {
    const self = this;
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'contact-list'
    });

    this.rx.select<IDeliveryTime>('deliveryTime').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((t: IDeliveryTime) => {
      if (t) {
        self.deliverTime = t;
      }
    });
  }

  ngOnInit() {
    const self = this;
    this.rx.select('account').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: IAccount) => {
      // this.contactSvc.find({where: {accountId: account.id}}).subscribe((contacts: IContact[]) => {
      //   self.items = contacts;
      //   contacts.sort((a: IContact, b: IContact) => {
      //     if (this.sharedSvc.compareDateTime(a.modified, b.modified)) {
      //       return -1;
      //     } else {
      //       return 1;
      //     }
      //   });
      // });


      // self.contactSvc.find({where: {accountId: account.id}}).subscribe(r => {
      //   if (r && r.length > 0) {
      //     this.items = r;
      //   } else {
      //     const data = new Contact({accountId: account.id, account: account, location: self.location, buzzCode: '' });
      //     this.items = [data];
      //     this.contactSvc.save(data).subscribe(() => {});
      //   }
      // });
    });

    this.rx.select('contact').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((contact: IContact) => {
      contact.address = self.locationSvc.getAddrString(contact.location);
      this.items = [contact];
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  select(contact: IContact) {
    const self = this;

    this.rx.dispatch({
      type: ContactActions.UPDATE,
      payload: contact
    });

    self.mallSvc.calcMalls(contact.location, self.deliverTimeType).then((malls: IMall[]) => {
      self.malls = malls;
      self.rx.dispatch({
        type: MallActions.UPDATE,
        payload: self.malls.filter(r => r.type === 'real')
      });
    });

    // if (!contact.phone || !contact.address) {
    //   this.router.navigate(['contact/form']);
    // } else {
    this.router.navigate(['order/form']);
    // }
  }

  edit(item: IContact) {
    this.rx.dispatch({
      type: ContactActions.UPDATE,
      payload: item
    });
    this.router.navigate(['contact/form']);
  }
}
