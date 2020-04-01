// import { Mall } from "../../models/mall";
// import { DB } from "../../db";
// import { expect } from 'chai';
// import { Config } from "../../config";
// import { ILocation } from "../../models/distance";


// describe('mall getScheduledMallIds', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let mallModel: Mall;
//   let connection: any = null;
//   const ds = [
//     { areaId: '5d8e60981a3174727b9a4b19', dow: 0, expect: ['5d2c62a8d1ba443c034764a9'] }, // metro
//     { areaId: '5d8e60981a3174727b9a4b19', dow: 2, expect: ['5d2c62a8d1ba443c034764a9'] }, // metro
//     { areaId: '5d8e60981a3174727b9a4b19', dow: 4, expect: ['5d2c62a8d1ba443c034764a9'] }, // metro
//     { areaId: '5d8e60981a3174727b9a4b19', dow: 6, expect: ['5d2c62a8d1ba443c034764a9'] }, // metro
//     { areaId: '5d8e60981a3174727b9a4b19', dow: 1, expect: ['5cca676b8b79db0d3aaaa058'] }, // first markham place
//     { areaId: '5d8e60981a3174727b9a4b19', dow: 3, expect: ['5cca676b8b79db0d3aaaa058'] }, // first markham place
//     { areaId: '5d8e60981a3174727b9a4b19', dow: 5, expect: ['5cca676b8b79db0d3aaaa058'] }, // first markham place
//   ];

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       mallModel = new Mall(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   for(let i=0; i<ds.length; i++){
//     it('should return mall ids', (done) => {
//       const d = ds[i];
//       mallModel.getScheduledMallIds(d.areaId, d.dow).then((mallIds: string[]) => {
//         expect(mallIds[0]).to.equal(d.expect[0]);
//         done();
//       });
//     });
//   }
// }); // end of getScheduledMallIds


// // to enhance
// describe('distance getRoadDistanceToMalls', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let mallModel: Mall;
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

//   const ds = [
//     { origin: origin, expect: [
//       {element: {distance:{text:'27', value: 27825}}},
//       {element: {distance:{text:'27', value: 27825}}},
//       {element: {distance:{text:'27', value: 27825}}},
//       {element: {distance:{text:'27', value: 27825}}},
//       {element: {distance:{text:'27', value: 27825}}},
//       {element: {distance:{text:'27', value: 27825}}},
//       {element: {distance:{text:'27', value: 27825}}},
//     ] },
//     // { origin: null, destinations: [], expect: [] },
//   ];

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       mallModel = new Mall(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   for (let i = 0; i < ds.length; i++) {
//     it('should get distances', (done) => {
//       const d = ds[i];
//       mallModel.getRoadDistanceToMalls(d.origin).then(r => {
//         expect(r.length).to.equal(d.expect.length);
//         done();
//       });
//     });
//   }
// }); // end of getRoadDistanceToMalls