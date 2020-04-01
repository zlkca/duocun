// import { Merchant } from "../../models/merchant";
// import { DB } from "../../db";
// import { expect } from 'chai';
// import moment from "../../../node_modules/moment";
// import { Config } from "../../config";
// import { ILocation } from "../../models/distance";

// describe('isOpeningDayOfWeek', () => {
//   it('should return closing or open', () => {
//     const db = new DB();
//     const m = new Merchant(db);

//     const datas = [
//       { dow: '0,1,2,3,4,5,6', dt: moment('2019-11-03T13:52:59.566Z'), ret: true },
//       { dow: '1,2,3,4,5,6', dt: moment('2019-11-03T13:52:59.566Z'), ret: false },
//       { dow: '0,1,2,3,4,5,6', dt: moment('2019-11-02T13:52:59.566Z'), ret: true },
//       { dow: '0,1,2,3,4,5', dt: moment('2019-11-02T13:52:59.566Z'), ret: false }
//     ];

//     datas.map(d => {
//       const r: boolean = m.isOpeningDayOfWeek(d.dt, d.dow);
//       expect(r).to.equal(d.ret);
//     });
//   });
// });

// describe('isClosed', () => {
//   it('should return closing or open', () => {
//     const db = new DB();
//     const m = new Merchant(db);

//     const datas = [
//       { dow: '0,1,2,3,4,5,6', closed: [], dt: moment('2019-11-03T13:52:59.566Z'), ret: false },
//       { dow: '1,2,3,4,5,6', closed: [], dt: moment('2019-11-03T13:52:59.566Z'), ret: true },
//       { dow: '0,1,2,3,4,5,6', closed: [], dt: moment('2019-11-02T13:52:59.566Z'), ret: false },
//       { dow: '0,1,2,3,4,5', closed: [], dt: moment('2019-11-02T13:52:59.566Z'), ret: true },

//       { dow: '0,1,2,3,4,5,6', closed: ['2019-11-03', '2019-11-02'], dt: moment('2019-11-03T13:52:59.566Z'), ret: true },
//       { dow: '1,2,3,4,5,6', closed: ['2019-11-02T', '2019-11-04'], dt: moment('2019-11-03T13:52:59.566Z'), ret: true },
//       { dow: '0,1,2,3,4,5,6', closed: ['2019-11-03T13:52:59.566Z', '2019-11-02T13:52:59.566Z'], dt: moment('2019-11-02T13:52:59.566Z'), ret: true },
//       { dow: '0,1,2,3,4,5', closed: ['2019-11-03T13:52:59.566Z', '2019-11-04T13:52:59.566Z'], dt: moment('2019-11-02T13:52:59.566Z'), ret: true },

//       { dow: '0,1,2,3,4,5,6', closed: ['2019-11-01T13:52:59.566Z', '2019-11-02T13:52:59.566Z'], dt: moment('2019-11-03T13:52:59.566Z'), ret: false },
//       { dow: '1,2,3,4,5,6', closed: ['2019-11-03T13:52:59.566Z', '2019-11-04T13:52:59.566Z'], dt: moment('2019-11-02T13:52:59.566Z'), ret: false },
//     ];

//     datas.map(d => {
//       const r: boolean = m.isClosed(d.dt, d.closed, d.dow);
//       expect(r).to.equal(d.ret);
//     });
//   });
// });

// describe('getOrderEndTime with area', () => {
//   it('should return closing or open', () => {
//     const db = new DB();
//     const m = new Merchant(db);

//     const inputs = [
//       { expected: '11:00', area: { _id: '', code: 'C', name: 'center', lat: 0, lng: 0 }, phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }] },
//       { expected: '10:00', area: { _id: '', code: 'M', name: 'center', lat: 0, lng: 0 }, phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }] },
//     ];

//     inputs.map(d => {
//       const r: string = m.getOrderEndTime(d.phases, d.area);
//       expect(r).to.equal(d.expected);
//     });
//   });
// }); // getOrderEndTime with area

// describe('getOrderEndTime without area', () => {
//   it('should return closing or open', () => {
//     const db = new DB();
//     const m = new Merchant(db);

//     const inputs = [
//       { expected: '', phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }] }
//     ];

//     inputs.map(d => {
//       const r: string = m.getOrderEndTime(d.phases);
//       expect(r).to.equal(d.expected);
//     });
//   });
// }); // getOrderEndTime without area

// describe('isOrderEnded', () => {
//   it('should return is order ended or not', () => {
//     const db = new DB();
//     const m = new Merchant(db);

//     const inputs = [
//       // deliver today, center before 10:00 AM
//       {
//         expected: false,
//         t: moment('05-17-2018 9:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-17-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'C', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },
//       // deliver today, center after 10:00 AM and before 11:00AM
//       {
//         expected: false,
//         t: moment('05-17-2018 10:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-17-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'C', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },
//       // deliver today, center after 11:00 AM 
//       {
//         expected: true,
//         t: moment('05-17-2018 11:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-17-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'C', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },

//       // deliver tomorrow, center before 10:00 AM
//       {
//         expected: false,
//         t: moment('05-17-2018 9:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-18-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'C', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },
//       // deliver tomorrow, center after 10:00 AM and before 11:00AM
//       {
//         expected: false,
//         t: moment('05-17-2018 10:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-18-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'C', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },
//       // deliver tomorrow, center after 11:00 AM 
//       {
//         expected: false,
//         t: moment('05-17-2018 11:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-18-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'C', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },

//       // deliver today, non-center before 10:00 AM
//       {
//         expected: false,
//         t: moment('05-17-2018 9:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-17-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'M', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },
//       // deliver today, none-center after 10:00 AM and before 11:00AM
//       {
//         expected: true,
//         t: moment('05-17-2018 10:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-17-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'M', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },
//       // deliver today, none-center after 11:00 AM 
//       {
//         expected: true,
//         t: moment('05-17-2018 11:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-17-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'M', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },

//       // deliver tomorrow, non-center before 10:00 AM
//       {
//         expected: false,
//         t: moment('05-17-2018 9:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-18-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'M', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },
//       // deliver tomorrow, non-center after 10:00 AM and before 11:00AM
//       {
//         expected: false,
//         t: moment('05-17-2018 10:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-18-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'M', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },
//       // deliver tomorrow, none-center after 11:00 AM 
//       {
//         expected: false,
//         t: moment('05-17-2018 11:40 AM', 'MM-DD-YYYY hh:mm A'),
//         delivered: moment('05-18-2018 23:40 AM', 'MM-DD-YYYY hh:mm A'),
//         area: { _id: '', code: 'M', name: 'center', lat: 0, lng: 0 },
//         phases: [{ orderEnd: '10:00', pickup: '' }, { orderEnd: '11:00', pickup: '' }]
//       },
//     ];

//     inputs.map(d => {
//       const r: boolean = m.isOrderEnded(d.t, d.delivered, d.area, d.phases);
//       expect(r).to.equal(d.expected);
//     });
//   });
// }); // isOrderEnded

// describe('merchant joinFind query id', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let merchantModel: Merchant;
//   let connection: any = null;

//   const d = {merchantId: '5ded91a7707f730f042d2f58', accountId:'5cc84b506896b1635459e1cd', mallId:'5cca676b8b79db0d3aaaa058' }

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       merchantModel = new Merchant(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return merchants with mall and account fileld', (done) => {
//     merchantModel.joinFind({ _id: d.merchantId }).then(rs => {
//       expect(rs.length).to.equal(1);
//       expect(rs[0]._id.toString().length).to.equal(24);
//       expect(rs[0].accountId.toString()).to.equal(d.accountId);
//       expect(rs[0].mallId.toString()).to.equal(d.mallId);

//       const mall: any = rs[0].mall;
//       expect(mall._id.toString().length).to.equal(24);
//       done();
//     });
//   });
// }); // end of merchant joinFind

// describe('merchant joinFind all', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let merchantModel: Merchant;
//   let connection: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       merchantModel = new Merchant(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return merchants with mall and account fileld', (done) => {
//     merchantModel.joinFind({}).then(rs => {
//       rs.map(r => {
//         expect(r._id.toString().length).to.equal(24);
//         expect(r.accountId.toString().length).to.equal(24);
//         expect(r.mallId.toString().length).to.equal(24);
//         expect(r.nameEN).to.not.equal(null);
//         const mall: any = rs[0].mall;
//         expect(mall._id.toString().length).to.equal(24);
//       });

//       done();
//     });
//   });
// }); // end of merchant joinFind


// describe('loadByDeliveryInfo without location', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let merchantModel: Merchant;
//   let connection: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       merchantModel = new Merchant(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return merchants with mall and account fileld', (done) => {
//     const dt = moment('2019-11-03T03:52:59.566Z'); // saturday
//     merchantModel.loadByDeliveryInfo({}, dt).then(rs => {
//       rs.map(r => {
//         expect(r._id.toString().length).to.equal(24);
//         expect(r.accountId.toString().length).to.equal(24);
//         expect(r.mallId.toString().length).to.equal(24);
//         expect(r.onSchedule).to.equal(true);
//         expect(r.distance).to.equal(0);
//         expect(r.orderEnded).to.equal(false);
//         expect(r.orderEndTime).to.equal('');
//         expect(r.isClosed).to.equal(false);
//         // expect(r.nameEN).to.not.equal(null);
//         const mall: any = rs[0].mall;
//         expect(mall._id.toString().length).to.equal(24);
//       });

//       done();
//     });
//   });
// }); // end of loadByDeliveryInfo without location

// describe('loadByDeliveryInfo with location and date', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let merchantModel: Merchant;
//   let connection: any = null;
//   let origin: ILocation = {
//     placeId: 'ChIJKexEE0jRKogRH2KLGSg9bIA',
//     lat: 43.9990221,
//     lng: -79.4915457,
//     city: 'Aurora',
//     province: 'ON',
//     streetName: 'Delayne Dr',
//     streetNumber: '195'
//   };
//   let dt = moment.utc('2019-11-03T03:52:59.566Z');

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       merchantModel = new Merchant(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return merchants with mall and account fileld', (done) => {
//     merchantModel.loadByDeliveryInfo({}, dt, origin).then(rs => {
//       rs.map(r => {
//         expect(r._id.toString().length).to.equal(24);
//         if(r.mallId === '5cca676b8b79db0d3aaaa058'){ // first markham place
//           expect(r.onSchedule).to.equal(false);
//         }

//         if(r.mallId === '5d2e9d79d1ba443c034764ab'){ // metro
//           expect(r.onSchedule).to.equal(true);
//         }
//       });

//       done();
//     });
//   });
// }); // end of loadByDeliveryInfo with location
