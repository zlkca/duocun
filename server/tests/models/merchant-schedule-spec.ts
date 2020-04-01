import { DB } from "../../db";
import { Config } from "../../config";
import moment from 'moment';
import { expect } from 'chai';
import {MerchantSchedule} from "../../models/merchant-schedule";

describe('mall getScheduledMallIds', () => {
  const db: any = new DB();
  const cfg: any = new Config();
  let scheduleModel: MerchantSchedule;
  // let connection;

  before(function (done) {
    db.init(cfg.DATABASE).then((dbClient: any) => {
      // connection = dbClient;
      scheduleModel = new MerchantSchedule(db);
      done();
    });
  });

  after(function (done) {
    // connection.close();
    done();
  });

  it('should return merchants with mall and account fileld', () => {

  });

  // // myDateTime -- '2020-03-23 23:58:00'
  // // ms --- moment objects
  // // getLatest(myDateTime, ms)
  // it('getLatest should be 03-25', () => {
    
  //   const myDateTime = '2020-03-25 23:58:00';
  //   const ms = [moment('2020-03-24 23:59:00'), moment('2020-03-25 23:59:00'), moment('2020-03-27 23:59:00')];
  //   const date = scheduleModel.getLatest(myDateTime, ms);
  //   expect(date.format('YYYY-MM-DD')).to.equal('2020-03-25');
  // });
  // it('getLatest should be 03-27', () => {
    
  //   const myDateTime = '2020-03-25 23:58:00';
  //   const ms = [moment('2020-03-24 23:59:00'), moment('2020-03-27 23:59:00')];
  //   const date = scheduleModel.getLatest(myDateTime, ms);
  //   expect(date.format('YYYY-MM-DD')).to.equal('2020-03-27');
  // });

  // // myDateTime -- '2020-03-23 23:58:00'
  // // orderEndList -- [{dow:2, time:'10:00'}, {dow:3, time:'23:59'}, {dow:5, time: '23:59'}]
  // // deliverDowList -- [2,4,6]
  // it('getBaseDateList should be this Tuesday', () => {
    
  //   const myDateTime = '2020-03-25 23:58:00';
  //   const oeList = [{ dow: 1, time: '23:59' }, { dow: 3, time: '23:59' }, { dow: 5, time: '23:59' }];
  //   const dates = scheduleModel.getBaseDateList(myDateTime, oeList, [2, 4, 6]);
  //   // dates.map(d => console.log(d.format('YYYY-MM-DD')));
  //   expect(dates[0].format('YYYY-MM-DD')).to.equal('2020-03-26');
  //   expect(dates[1].format('YYYY-MM-DD')).to.equal('2020-03-28');
  //   expect(dates[2].format('YYYY-MM-DD')).to.equal('2020-03-31');
  // });

  // it('getBaseDateList should be this Tuesday', () => {
    
  //   const myDateTime = '2020-03-27 23:58:00';
  //   const oeList = [{ dow: 1, time: '23:59' }, { dow: 3, time: '23:59' }, { dow: 5, time: '23:59' }];
  //   const dates = scheduleModel.getBaseDateList(myDateTime, oeList, [2, 4, 6]);
  //   // dates.map(d => console.log(d.format('YYYY-MM-DD')));
  //   expect(dates[0].format('YYYY-MM-DD')).to.equal('2020-03-28');
  //   expect(dates[1].format('YYYY-MM-DD')).to.equal('2020-03-31');
  //   expect(dates[2].format('YYYY-MM-DD')).to.equal('2020-04-02');
  // });

  // it('getBaseDateList should be this Tuesday', () => {
    
  //   const myDateTime = '2020-03-29 23:58:00';
  //   const oeList = [{ dow: 1, time: '23:59' }, { dow: 3, time: '23:59' }, { dow: 5, time: '23:59' }];
  //   const dates = scheduleModel.getBaseDateList(myDateTime, oeList, [2, 4, 6]);
  //   // dates.map(d => console.log(d.format('YYYY-MM-DD')));
  //   expect(dates[0].format('YYYY-MM-DD')).to.equal('2020-03-31');
  //   expect(dates[1].format('YYYY-MM-DD')).to.equal('2020-04-02');
  //   expect(dates[2].format('YYYY-MM-DD')).to.equal('2020-04-04');
  // });


  // it('getBaseDateList should be this Tuesday', () => {
    
  //   const myDateTime = '2020-03-30 23:12:00';
  //   const oeList = [{ dow: 1, time: '8:59' }, { dow: 3, time: '8:59' }, { dow: 5, time: '8:59' }];
  //   const dates = scheduleModel.getBaseDateList(myDateTime, oeList, [5]);
  //   // dates.map(d => console.log(d.format('YYYY-MM-DD')));
  //   expect(dates[0].format('YYYY-MM-DD')).to.equal('2020-04-03');
  // });

  // it('getBaseDateList should be this Tuesday', () => {
    
  //   const myDateTime = '2020-03-30 23:12:00';
  //   const oeList = [
  //     { dow: 0, time: '8:59' },
  //     { dow: 1, time: '8:59' },
  //     { dow: 2, time: '8:59' },
  //     { dow: 3, time: '8:59' },
  //     { dow: 4, time: '8:59' },
  //     { dow: 5, time: '8:59' }
  //   ];
  //   const dates = scheduleModel.getBaseDateList(myDateTime, oeList, [5]);
  //   // dates.map(d => console.log(d.format('YYYY-MM-DD')));
  //   expect(dates[0].format('YYYY-MM-DD')).to.equal('2020-04-03');
  // });

  // it('getBaseDateList should be this Tuesday', () => {
    
  //   const myDateTime = '2020-03-31 10:12:00';
  //   const oeList = [
  //     { dow: 1, time: '8:59' },
  //     { dow: 2, time: '8:59' },
  //     { dow: 3, time: '8:59' },
  //     { dow: 4, time: '8:59' },
  //     { dow: 5, time: '8:59' },
  //     { dow: 0, time: '8:59' }
  //   ];
  //   const dates = scheduleModel.getBaseDateList(myDateTime, oeList, [1, 3, 5]);
  //   // dates.map(d => console.log(d.format('YYYY-MM-DD')));
  //   expect(dates[0].format('YYYY-MM-DD')).to.equal('2020-04-03');
  // });

  // it('getBaseDateList should be this Tuesday', () => {
    
  //   const myDateTime = '2020-03-31 8:52:00';
  //   const oeList = [
  //     { dow: 1, time: '8:59' },
  //     { dow: 2, time: '8:59' },
  //     { dow: 3, time: '8:59' },
  //     { dow: 4, time: '8:59' },
  //     { dow: 5, time: '8:59' },
  //     { dow: 0, time: '8:59' }
  //   ];
  //   const dates = scheduleModel.getBaseDateList(myDateTime, oeList, [1, 3, 5]);
  //   // dates.map(d => console.log(d.format('YYYY-MM-DD')));
  //   expect(dates[0].format('YYYY-MM-DD')).to.equal('2020-04-01');
  // });


  // it('getBaseDateList should be this Tuesday', () => {
    
  //   const myDateTime = '2020-03-31 10:12:00';
  //   const oeList = [
  //     { dow: 1, time: '8:59' },
  //     { dow: 2, time: '8:59' },
  //     { dow: 3, time: '8:59' },
  //     { dow: 4, time: '8:59' },
  //     { dow: 5, time: '8:59' },
  //     { dow: 0, time: '8:59' }
  //   ];
  //   const baseDates: moment.Moment[] = scheduleModel.getBaseDateList(myDateTime, oeList, [1, 3, 5]);
  //   const dates = baseDates.map(b => b.format('YYYY-MM-DD'))
  //   const rs = scheduleModel.getDeliverySchedule(dates, ['11:20']);
  //   rs.map(d => console.log(d.date));
  //   expect(rs[0].date).to.equal('2020-04-03');
  // });
});