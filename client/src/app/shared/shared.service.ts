import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

declare var moment: any;

@Injectable()
export class SharedService {

  private subject = new Subject<any>();

  constructor() { }

  emitMsg(msg: any) {
    this.subject.next(msg);
  }

  getMsg(): Observable<any> {
    return this.subject.asObservable();
  }

  // scale image inside frame
  resizeImage(frame_w: number, frame_h: number, w: number, h: number) {
    let rw = 0;
    let rh = 0;

    if (h * frame_w / w > frame_h) {
      rh = frame_h;
      rw = w * frame_h / h;
    } else {
      rw = frame_w;
      rh = h * frame_w / w;
    }
    return { 'w': Math.round(rw), 'h': Math.round(rh), 'padding_top': Math.round((frame_h - rh) / 2) };
  }

  toDateTimeString(s) {
    // s --- dd-mm-yyy:hh:mm:ss.z000
    return s.split('.')[0].replace('T', ' ');
  }

  getTotal(items) {
    let total = 0;
    items.forEach(item => {
      total += item.price * item.quantity;
    });
    return total.toFixed(2);
  }

  getToday() {
    const m = moment(); // .utcOffset(0);
    return m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  getTomorrow() {
    return moment(new Date()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(1, 'days')
      .format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  getFirstDayOfMonth() {
    return moment().startOf('month').format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  getLastDayOfMonth() {
    return moment().endOf('month').format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  getMonday() {
    return moment().weekday(0).format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  getNextMonday() {
    return moment().weekday(7).format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  getNextDay() {
    const d = moment(new Date()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(1, 'days');
    return { day: d.date(), month: d.month() + 1, year: d.year() };
  }
}

