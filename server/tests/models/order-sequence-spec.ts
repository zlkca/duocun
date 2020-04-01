// import { OrderSequence } from "../../models/order-sequence";
// import { DB } from "../../db";
// import { expect } from 'chai';
// import moment from "moment";
// import { Config } from "../../config";
// import { IPhase } from "../../models/merchant";
// import { ILocation } from "../../models/location";

// describe('getUTC', () => {
//   it('should return utc date time', () => {
//     const db = new DB();
//     const sequenceModel = new OrderSequence(db);
//     const loc1: any = {
//       placeId: 'ChIJKexEE0jRKogRH2KLGSg9bIA',
//       lat: 43.9990221,
//       lng: -79.4915457,
//       city: 'Aurora',
//       province: 'ON',
//       streetName: 'Delayne Dr',
//       streetNumber: '195'
//     };
//     const loc2: any = {
//       placeId: 'ChIJKexEE0jRKogRH2KLGSg9bIA',
//       lat: 43.9990221,
//       lng: -79.4915457,
//       city: 'Aurora',
//       province: 'ON',
//       streetName: 'De Dr',
//       streetNumber: '9'
//     };

//     // utc time
//     const datas = [
//       { location: loc1, n: 0, expect: '195D00'},
//       { location: loc1, n: 2, expect: '195D02'},
//       { location: loc2, n: 25, expect: '9DED25' },
//       { location: loc1, n: 100, expect: '195D10' },
//     ];

//     datas.map(d => {
//       const r: string = sequenceModel.getCode(d.location, d.n);
//       expect(r).to.equal(d.expect);
//     });

//   });
// });