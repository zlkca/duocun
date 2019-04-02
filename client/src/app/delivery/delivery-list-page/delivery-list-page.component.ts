import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeliveryService } from '../delivery.service';
import { Subject, forkJoin } from 'rxjs';
import { IAppState } from '../../store';
import { NgRedux } from '@angular-redux/store';
import { takeUntil, first } from '../../../../node_modules/rxjs/operators';
import { Delivery } from '../delivery.model';
import { IAccount } from '../../account/account.model';
import { ILocation } from '../../location/location.model';
import { LocationService } from '../../location/location.service';
import { Router } from '../../../../node_modules/@angular/router';
import { DeliveryActions } from '../delivery.actions';

@Component({
  selector: 'app-delivery-list-page',
  templateUrl: './delivery-list-page.component.html',
  styleUrls: ['./delivery-list-page.component.scss']
})
export class DeliveryListPageComponent implements OnInit, OnDestroy {

  items: Delivery[];
  location: ILocation;
  private onDestroy$ = new Subject<any>();
  constructor(
    private deliverySvc: DeliveryService,
    private locationSvc: LocationService,
    private rx: NgRedux<IAppState>,
    private router: Router
  ) { }

  ngOnInit() {
    const self = this;
    this.rx.select('account').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: IAccount) => {
      // self.deliverySvc.find({where: {accountId: account.id}}).subscribe(r => {
      //   if (r && r.length > 0) {
      //     this.items = r;
      //   } else {
      //     const data = new Delivery({accountId: account.id, account: account, location: self.location, buzzCode: '' });
      //     this.items = [data];
      //     this.deliverySvc.save(data).subscribe(() => {});
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
      self.deliverySvc.find({where: {accountId: account.id}}).subscribe(r => {
        if (r && r.length > 0) {
          this.items = r;
        } else {
          const data = new Delivery({accountId: account.id, account: account,
            location: location,
            buzzCode: '',
            address: self.locationSvc.getAddrString(location)
          });
          this.items = [data];
          this.deliverySvc.save(data).subscribe(() => {});
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
      type: DeliveryActions.UPDATE,
      payload: item
    });
    this.router.navigate(['order/form']);
  }
}
