import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as moment from 'moment';

interface IPhase {
  orderEnd: string; // hh:mm
  pickup: string; // hh:mm
}

@Injectable()
export class SharedService {
  constructor() { }

  // date --- moment object
  getDateType(date) {
    return date.isSame(moment(), 'day') ? 'today' : 'tomorrow';
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

  toDateString(s) {
    // s --- dd-mm-yyy:hh:mm:ss.z000
    return s.split('.')[0].split('T')[0];  }

  getTotal(items) {
    let total = 0;
    items.forEach(item => {
      total += item.price * item.quantity;
    });
    return total.toFixed(2);
  }

  // type --- 'day', 'date', week', 'month', 'year', 12:00 am
  getStartOf(type) {
    return moment().startOf(type);
  }

  // type --- 'day', 'date', week', 'month', 'year', 23:59:59.999
  getEndOf(type) {
    return moment().endOf(type);
  }

  // offset 0 -- monday
  getWeekday(date, offset) {
    return date.weekday(offset);
  }

  formatDateTime(date) {
    return date.format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  getTodayString() {
    const m = moment(); // .utcOffset(0);
    return m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD');
  }

  // for compare purpose only
  getNextNDay(offset: number) {
    return moment(new Date()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(offset, 'days')
      .format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  getNextNDayString(offset: number) {
    return moment(new Date()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(offset, 'days')
      .format('YYYY-MM-DD');
  }

  compareDateTime(a: any, b: any) {
    return moment(a).isAfter(b);
  }

  isOverdue(h: number, m: number = 0) {
    const a = moment(new Date()).set({ hour: h, minute: m, second: 0, millisecond: 0 });
    const b = moment(new Date());
    return b > a;
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


  getMediaUrl() {
    return environment.MEDIA_URL;
  }

  // local --- local date time string '2019-11-03T11:20:00.000Z', local.isUTC() must be false.
  // sLocalTime     --- local hour and minute eg. '11:20'
  // return --- utc date time
  setLocalTime(localDateTime: moment.Moment, sLocalTime: string): moment.Moment {
    const hour = +(sLocalTime.split(':')[0]);   // local hour
    const minute = +(sLocalTime.split(':')[1]); // local minute
    return localDateTime.set({ hour: hour, minute: minute, second: 0, millisecond: 0 });
  }

  // sUTC --- utc date time string
  toLocalDateTimeString(sUTC: string) {
    return moment(sUTC).local().format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
  }

  getDateString(dt) {
    const m = dt.month() + 1;
    const d = dt.date();
    const sm = m < 10 ? ('0' + m) : ('' + m);
    const sd = d < 10 ? ('0' + d) : ('' + d);
    return dt.year() + '-' + sm + '-' + sd;
  }

  // dateType --- string, 'today' or 'tomorrow'
  // if over 11:30, the return dt is 11:20, this shouldn't happen
  // return --- local date time string
  // created --- must be local date time string!!! '2019-11-03T11:20:00.000Z'
  getDeliveryDateTimeByPhase(sCreated: string, phases: IPhase[], dateType: string) {
    const created = moment(sCreated);

    if (dateType === 'today') {
      const deliverDate = this.getDateString(created);
      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const orderEndTime = this.setLocalTime(moment(sCreated), phase.orderEnd);

        if (i === 0) {
          if (created.isSameOrBefore(orderEndTime)) {
            return {deliverDate, deliverTime: phase.pickup}; // this.setLocalTime(moment(sCreated), phase.pickup).toISOString();
          } else {
            // pass
          }
        } else {
          const prePhase = phases[i - 1];
          const preEndTime = this.setLocalTime(moment(sCreated), prePhase.orderEnd);

          if (created.isAfter(preEndTime) && created.isSameOrBefore(orderEndTime)) {
            return {deliverDate, deliverTime: phase.pickup}; // this.setLocalTime(moment(sCreated), phase.pickup).toISOString();
          } else {
            // pass
          }
        }
      }
      // if none of the phase hit, use the first
      const first = phases[0];
      const deliverTime = first.pickup;
      return {deliverDate, deliverTime}; // this.setLocalTime(moment(sCreated), first.pickup).toISOString();
    } else {
      const deliverDate = this.getDateString(moment(sCreated).add(1, 'day'));
      const phase = phases[0];
      const deliverTime = phase.pickup;
      return {deliverDate, deliverTime}; // this.setLocalTime(moment(sCreated), phase.pickup).add(1, 'day').toISOString();
    }
  }

}

