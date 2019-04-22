import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactService } from '../contact.service';
import { Subject, forkJoin } from 'rxjs';
import { IAppState } from '../../store';
import { NgRedux } from '@angular-redux/store';
import { takeUntil, first } from '../../../../node_modules/rxjs/operators';
import { IContact } from '../contact.model';
import { IAccount } from '../../account/account.model';
import { ILocation, IDistance } from '../../location/location.model';
import { Router } from '../../../../node_modules/@angular/router';
import { ContactActions } from '../contact.actions';
import { PageActions } from '../../main/main.actions';
import { SharedService } from '../../shared/shared.service';
import { MallService } from '../../mall/mall.service';
import { IMall } from '../../mall/mall.model';
import { MallActions } from '../../mall/mall.actions';
import { IDeliveryTime } from '../../delivery/delivery.model';
import { LocationService } from '../../location/location.service';
import { DistanceService } from '../../location/distance.service';

@Component({
  selector: 'app-contact-list-page',
  templateUrl: './contact-list-page.component.html',
  styleUrls: ['./contact-list-page.component.scss']
})
export class ContactListPageComponent implements OnInit, OnDestroy {

  items: IContact[];
  location: ILocation;
  // malls: IMall[];
  deliverTimeType: string;
  deliverTime: IDeliveryTime;
  malls: IMall[] = [
    {
      id: '1', name: 'Richmond Hill', type: 'real', lat: 43.8461479, lng: -79.37935279999999, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '2', name: 'Arora', type: 'virtual', lat: 43.995042, lng: -79.442369, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '3', name: 'Markham', type: 'virtual', lat: 43.867055, lng: -79.284616, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    },
    {
      id: '4', name: 'Richmond Hill', type: 'virtual', lat: 43.884244, lng: -79.467925, radius: 8,
      placeId: 'ChIJmYOyFEsrK4gRM55wYvQ7Gk0', workers: [{ id: '5c9966b7fb86d40a4414eb79', username: 'worker' }]
    }
  ];
  private onDestroy$ = new Subject<any>();
  constructor(
    private contactSvc: ContactService,
    private locationSvc: LocationService,
    private distanceSvc: DistanceService,
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
      if (contact.location) {
        contact.address = self.locationSvc.getAddrString(contact.location);
      }
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

    const destinations: ILocation[] = [];
    self.malls.filter(r => r.type === 'real').map(m => {
      destinations.push({lat: m.lat, lng: m.lng, placeId: m.placeId});
    });

    self.distanceSvc.find({where: {originPlaceId: contact.location.placeId}}).pipe(
      takeUntil(self.onDestroy$)
    ).subscribe((ds: IDistance[]) => {
      if (ds && ds.length > 0) {
        self.updateDistanceToMalls(ds);
        self.router.navigate(['order/form']);
      } else {
        self.locationSvc.reqRoadDistances(contact.location, destinations).pipe(
          takeUntil(this.onDestroy$)
        ).subscribe((rs: IDistance[]) => {
          if (rs) {
            self.updateDistanceToMalls(rs);
            self.router.navigate(['order/form']);
          } else {
            alert('地址有误无法下单，请退出重试');
          }
        }, err => {
          alert(err);
          // reject([]);
        });
      }
    });
  }

  updateDistanceToMalls(rs) {
    const self = this;
    const reallDistances = rs; // .filter(r => r.type === 'real');
    self.malls.map((mall: IMall) => {
      const d = reallDistances.find(rm => rm.destination.lat === mall.lat && rm.destination.lng === mall.lng);
      if (d) {
        mall.distance = d.element.distance.value / 1000;
        mall.fullDeliverFee = self.distanceSvc.getFullDeliveryFee(mall.distance);
        mall.deliverFee = self.distanceSvc.getDeliveryFee(mall.distance, self.deliverTimeType);
      }
    });
    self.rx.dispatch({
      type: MallActions.UPDATE,
      payload: self.malls.filter(r => r.type === 'real')
    });
  }

  edit(item: IContact) {
    this.rx.dispatch({
      type: ContactActions.UPDATE,
      payload: item
    });
    this.router.navigate(['contact/form']);
  }
}
