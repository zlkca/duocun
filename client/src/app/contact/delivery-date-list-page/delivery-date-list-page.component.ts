import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { IDeliveryTime } from '../../delivery/delivery.model';

import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import { PageActions } from '../../main/main.actions';
import { IDeliveryTimeAction } from '../../delivery/delivery-time.reducer';
import { DeliveryTimeActions } from '../../delivery/delivery-time.actions';
@Component({
  selector: 'app-delivery-date-list-page',
  templateUrl: './delivery-date-list-page.component.html',
  styleUrls: ['./delivery-date-list-page.component.scss']
})
export class DeliveryDateListPageComponent implements OnInit {
  deliveryTime: IDeliveryTime = { type: '', text: '', date: '', startTime: '', endTime: '' };
  deliveryDiscount = 2;
  orderDeadline = { h: 9, m: 30 };
  onDestroy$ = new Subject<any>();
  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>
  ) {
  }

  ngOnInit() {
    const self = this;
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'delivery-date-list'
    });
    this.rx.select('deliveryTime').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((t: IDeliveryTime) => {
      self.deliveryTime = t;
    });
  }

  onSelectDeliveryTime(e: IDeliveryTime) {
    if (e) {
      this.deliveryTime = e;
      this.rx.dispatch<IDeliveryTimeAction>({
        type: DeliveryTimeActions.UPDATE,
        payload: e
      });
      setTimeout(() => {
        this.router.navigate(['contact/form']);
      }, 500);
    }
  }
}
