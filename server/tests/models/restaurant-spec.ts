import { Restaurant } from "../../models/restaurant";
import { DB } from "../../db";
import { expect } from 'chai';
import moment from "../../../node_modules/moment";

describe('isOpeningDayOfWeek', () => {
  it('should return closing or open', () => {
    const db = new DB();
    const m = new Restaurant(db);

    const datas = [
      {dow: '0,1,2,3,4,5,6', dt: moment('2019-11-03T13:52:59.566Z'), ret: true},
      {dow: '1,2,3,4,5,6',   dt: moment('2019-11-03T13:52:59.566Z'), ret: false},
      {dow: '0,1,2,3,4,5,6', dt: moment('2019-11-02T13:52:59.566Z'), ret: true},
      {dow: '0,1,2,3,4,5',   dt: moment('2019-11-02T13:52:59.566Z'), ret: false}
    ];

    datas.map(d => {
      const r: boolean = m.isOpeningDayOfWeek(d.dt, d.dow);
      expect(r).to.equal(d.ret);
    });
  });
});

describe('isClosed', () => {
  it('should return closing or open', () => {
    const db = new DB();
    const m = new Restaurant(db);

    const datas = [
      {dow: '0,1,2,3,4,5,6', closed: [], dt: moment('2019-11-03T13:52:59.566Z'), ret: false},
      {dow: '1,2,3,4,5,6',   closed: [], dt: moment('2019-11-03T13:52:59.566Z'), ret: true},
      {dow: '0,1,2,3,4,5,6', closed: [], dt: moment('2019-11-02T13:52:59.566Z'), ret: false},
      {dow: '0,1,2,3,4,5',   closed: [], dt: moment('2019-11-02T13:52:59.566Z'), ret: true},

      {dow: '0,1,2,3,4,5,6', closed: ['2019-11-03T13:52:59.566Z', '2019-11-02T13:52:59.566Z'], dt: moment('2019-11-03T13:52:59.566Z'), ret: true},
      {dow: '1,2,3,4,5,6',   closed: ['2019-11-02T13:52:59.566Z', '2019-11-04T13:52:59.566Z'], dt: moment('2019-11-03T13:52:59.566Z'), ret: true},
      {dow: '0,1,2,3,4,5,6', closed: ['2019-11-03T13:52:59.566Z', '2019-11-02T13:52:59.566Z'], dt: moment('2019-11-02T13:52:59.566Z'), ret: true},
      {dow: '0,1,2,3,4,5',   closed: ['2019-11-03T13:52:59.566Z', '2019-11-04T13:52:59.566Z'], dt: moment('2019-11-02T13:52:59.566Z'), ret: true},

      {dow: '0,1,2,3,4,5,6', closed: ['2019-11-01T13:52:59.566Z', '2019-11-02T13:52:59.566Z'], dt: moment('2019-11-03T13:52:59.566Z'), ret: false},
      {dow: '1,2,3,4,5,6',   closed: ['2019-11-03T13:52:59.566Z', '2019-11-04T13:52:59.566Z'], dt: moment('2019-11-02T13:52:59.566Z'), ret: false},
    ];

    datas.map(d => {
      const r: boolean = m.isClosed(d.dt, d.closed, d.dow);
      expect(r).to.equal(d.ret);
    });
  });
});