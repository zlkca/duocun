// import { Range } from "../../models/range";
// import { DB } from "../../db";
// import { expect } from 'chai';
// import { Config } from "../../config";
// import { ILocation } from "../../models/distance";


// describe('range getOverRange', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let rangeModel: Range;
//   let connection: any = null;
//   const ds = [
//     { 
//       placeId: 'ChIJsdx07TQrK4gRLx1zHjnKEbg',
//       streetNumber: '30',
//       streetName: 'Fulton Way',
//       city: 'Richmond Hill',
//       province: 'ON',
//       lat:43.8515003,
//       lng:-79.3823725,
//       expect: {distance: 0, rate: 0}
//     },
//     { 
//       placeId: 'ChIJtcnI4FfTKogRZzpAoyaxIpA',
//       streetNumber: '13838',
//       streetName: 'Woodbine Avenue',
//       city: 'Gormley',
//       province: 'ON',
//       lat:43.981257,
//       lng:-79.3903055,
//       expect: {distance: 5.525, rate: 1}
//     },
//   ];

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       rangeModel = new Range(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   for(let i=0; i<ds.length; i++){
//     it('should return range distance', (done) => {
//       const d = ds[i];
//       rangeModel.getOverRange(d).then((r: any) => {
//         expect(r.distance).to.equal(d.expect.distance);
//         expect(r.rate).to.equal(d.expect.rate);
//         done();
//       });
//     });
//   }
// }); // end of getOverRange
