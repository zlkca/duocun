import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SharedService } from '../shared.service';
import { IDeliveryTime } from '../../delivery/delivery.model';
import * as moment from 'moment';
@Component({
  selector: 'app-delivery-date-list',
  templateUrl: './delivery-date-list.component.html',
  styleUrls: ['./delivery-date-list.component.scss']
})
export class DeliveryDateListComponent implements OnInit {

  @Input() endTime;
  @Input() deliveryDiscount;
  @Output() afterSelectDate = new EventEmitter();
  overdue;
  afternoon;
  list: IDeliveryTime[] = [];

  constructor(
    private sharedSvc: SharedService
  ) {

  }

  ngOnInit() {
    const todayStart = moment().set({ hour: 11, minute: 45, second: 0, millisecond: 0 });
    const todayEnd = moment().set({ hour: 13, minute: 30, second: 0, millisecond: 0 });
    const tomorrowStart = moment().set({ hour: 11, minute: 45, second: 0, millisecond: 0 }).add(1, 'days');
    const tomorrowEnd = moment().set({ hour: 13, minute: 30, second: 0, millisecond: 0 }).add(1, 'days');
    const afterTomorrowStart = moment().set({ hour: 11, minute: 45, second: 0, millisecond: 0 }).add(2, 'days');
    const afterTomorrowEnd = moment().set({ hour: 13, minute: 30, second: 0, millisecond: 0 }).add(2, 'days');

    this.list = [
      {text: '今天午餐', from: todayStart.toDate(), to: todayEnd.toDate() },
      {text: '明天午餐', from: tomorrowStart.toDate(), to: tomorrowEnd.toDate() },
      {text: '后天午餐', from: afterTomorrowStart.toDate(), to: afterTomorrowEnd.toDate() },
    ];

    const a = moment().set({ hour: this.endTime.h, minute: this.endTime.m, second: 0, millisecond: 0 });
    const b = moment();
    this.overdue = b.isAfter(a);

    const c = moment().set({ hour: todayEnd.hour(), minute: todayEnd.minute(), second: 0, millisecond: 0 });
    this.afternoon = b.isAfter(c);
    this.deliveryDiscount = 2;
  }

  onSelectTime(t: IDeliveryTime) {
    this.afterSelectDate.emit(t);
  }

}
