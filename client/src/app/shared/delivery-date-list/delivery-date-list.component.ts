import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SharedService } from '../shared.service';
import { IDeliveryTime } from '../../delivery/delivery.model';

@Component({
  selector: 'app-delivery-date-list',
  templateUrl: './delivery-date-list.component.html',
  styleUrls: ['./delivery-date-list.component.scss']
})
export class DeliveryDateListComponent implements OnInit {

  @Input() orderDeadline;
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
    const today = this.sharedSvc.getTodayString();
    const tomorrow = this.sharedSvc.getNextNDayString(1);
    const dayAfterTomorrow = this.sharedSvc.getNextNDayString(2);

    this.list = [
      {type: 'lunch today', text: '今天午餐', date: today, startTime: '11:45', endTime: '13:30'},
      {type: 'lunch tomorrow', text: '明天午餐', date: tomorrow, startTime: '11:45', endTime: '13:30'},
      {type: 'lunch after tomorrow', text: '后天午餐', date: dayAfterTomorrow, startTime: '11:45', endTime: '13:30'}
    ];

    this.overdue = this.sharedSvc.isOverdue(this.orderDeadline.h, this.orderDeadline.m);
    const lunchEnd = this.list[0].endTime.split(':');
    this.afternoon = this.sharedSvc.isOverdue(parseInt(lunchEnd[0], 10), parseInt(lunchEnd[1], 10));
    this.deliveryDiscount = 2;
  }

  onSelectTime(type: string) {
    if (type) {
      const item = this.list.find(x => x.type === type);
      this.afterSelectDate.emit(item);
    }
  }
}
