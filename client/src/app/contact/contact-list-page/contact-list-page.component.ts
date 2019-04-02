import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactService } from '../contact.service';
import { Subject, forkJoin } from 'rxjs';
import { IAppState } from '../../store';
import { NgRedux } from '@angular-redux/store';
import { takeUntil, first } from '../../../../node_modules/rxjs/operators';
import { Contact } from '../contact.model';
import { IAccount } from '../../account/account.model';
import { ILocation } from '../../location/location.model';
import { LocationService } from '../../location/location.service';
import { Router } from '../../../../node_modules/@angular/router';
import { ContactActions } from '../contact.actions';
import { PageActions } from '../../main/main.actions';

@Component({
  selector: 'app-contact-list-page',
  templateUrl: './contact-list-page.component.html',
  styleUrls: ['./contact-list-page.component.scss']
})
export class ContactListPageComponent implements OnInit, OnDestroy {

  items: Contact[];
  location: ILocation;
  private onDestroy$ = new Subject<any>();
  constructor(
    private contactSvc: ContactService,
    private locationSvc: LocationService,
    private rx: NgRedux<IAppState>,
    private router: Router
  ) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'contact-list'
    });
  }

  ngOnInit() {
    const self = this;
    this.rx.select('account').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: IAccount) => {
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

    forkJoin([
      this.rx.select<IAccount>('account').pipe(
        first(),
        takeUntil(this.onDestroy$)
      ),
      this.rx.select<ILocation>('location').pipe(
        first(),
        takeUntil(this.onDestroy$)
      )
    ]).subscribe(vals => {
      const account = vals[0];
      const location = vals[1];
      self.contactSvc.find({where: {accountId: account.id}}).subscribe(r => {
        if (r && r.length > 0) {
          this.items = r;
        } else {
          const data = new Contact({accountId: account.id, account: account,
            location: location,
            buzzCode: '',
            address: self.locationSvc.getAddrString(location)
          });
          this.items = [data];
          this.contactSvc.save(data).subscribe(() => {});
        }
      });
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  select(item) {
    this.rx.dispatch({
      type: ContactActions.UPDATE,
      payload: item
    });
    this.router.navigate(['order/form']);
  }
}
