// import { Distance, IDistance, ILocation, IPlace } from "../../models/distance";
// import { DB } from "../../db";
// import { expect } from 'chai';
// import { Config } from "../../config";


// describe('distance dbHasAllPlaceIds', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let distanceModel: Distance;
//   let connection: any = null;
//   const ds = [
//     { destIds: [], dbDestIds: ['a'], expect: false },
//     { destIds: [], dbDestIds: [], expect: false },
//     { destIds: ['a'], dbDestIds: [], expect: false },
//     { // all same
//       destIds: [
//         "ChIJmYOyFEsrK4gRM55wYvQ7Gk0",
//         "ChIJIyQg3tLT1IkREC-Km7nbODI",
//         "ChIJ2YTMpu7U1IkRhtJeKzZMvE8",
//         "ChIJT8Sw6IPT1IkRi7kxtXUlIkU",
//         "ChIJ1xJ88TLU1IkRNnT_ycUGwdo",
//         "ChIJqwPrlk4rK4gR3Sp3QsgGbfE",
//         "ChIJrX94eCHV1IkRRtQJUOkCXfE"
//       ],
//       dbDestIds: [
//         "ChIJmYOyFEsrK4gRM55wYvQ7Gk0",
//         "ChIJIyQg3tLT1IkREC-Km7nbODI",
//         "ChIJ2YTMpu7U1IkRhtJeKzZMvE8",
//         "ChIJT8Sw6IPT1IkRi7kxtXUlIkU",
//         "ChIJ1xJ88TLU1IkRNnT_ycUGwdo",
//         "ChIJqwPrlk4rK4gR3Sp3QsgGbfE",
//         "ChIJrX94eCHV1IkRRtQJUOkCXfE"
//       ],
//       expect: true
//     },
//     { // order different, but same
//       destIds: [
//         "ChIJIyQg3tLT1IkREC-Km7nbODI",
//         "ChIJmYOyFEsrK4gRM55wYvQ7Gk0",
//         "ChIJ2YTMpu7U1IkRhtJeKzZMvE8",
//         "ChIJT8Sw6IPT1IkRi7kxtXUlIkU",
//         "ChIJ1xJ88TLU1IkRNnT_ycUGwdo",
//         "ChIJqwPrlk4rK4gR3Sp3QsgGbfE",
//         "ChIJrX94eCHV1IkRRtQJUOkCXfE"
//       ],
//       dbDestIds: [
//         "ChIJmYOyFEsrK4gRM55wYvQ7Gk0",
//         "ChIJIyQg3tLT1IkREC-Km7nbODI",
//         "ChIJ2YTMpu7U1IkRhtJeKzZMvE8",
//         "ChIJT8Sw6IPT1IkRi7kxtXUlIkU",
//         "ChIJ1xJ88TLU1IkRNnT_ycUGwdo",
//         "ChIJqwPrlk4rK4gR3Sp3QsgGbfE",
//         "ChIJrX94eCHV1IkRRtQJUOkCXfE"
//       ],
//       expect: true
//     },

//     { // destIds missing one
//       destIds: [
//         "ChIJmYOyFEsrK4gRM55wYvQ7Gk0",
//         "ChIJ2YTMpu7U1IkRhtJeKzZMvE8",
//         "ChIJT8Sw6IPT1IkRi7kxtXUlIkU",
//         "ChIJ1xJ88TLU1IkRNnT_ycUGwdo",
//         "ChIJqwPrlk4rK4gR3Sp3QsgGbfE",
//         "ChIJrX94eCHV1IkRRtQJUOkCXfE"
//       ],
//       dbDestIds: [
//         "ChIJmYOyFEsrK4gRM55wYvQ7Gk0",
//         "ChIJIyQg3tLT1IkREC-Km7nbODI",
//         "ChIJ2YTMpu7U1IkRhtJeKzZMvE8",
//         "ChIJT8Sw6IPT1IkRi7kxtXUlIkU",
//         "ChIJ1xJ88TLU1IkRNnT_ycUGwdo",
//         "ChIJqwPrlk4rK4gR3Sp3QsgGbfE",
//         "ChIJrX94eCHV1IkRRtQJUOkCXfE"
//       ],
//       expect: true
//     },

//     { // dbDestIds missing one
//       destIds: [
//         "ChIJIyQg3tLT1IkREC-Km7nbODI",
//         "ChIJmYOyFEsrK4gRM55wYvQ7Gk0",
//         "ChIJ2YTMpu7U1IkRhtJeKzZMvE8",
//         "ChIJT8Sw6IPT1IkRi7kxtXUlIkU",
//         "ChIJ1xJ88TLU1IkRNnT_ycUGwdo",
//         "ChIJqwPrlk4rK4gR3Sp3QsgGbfE",
//         "ChIJrX94eCHV1IkRRtQJUOkCXfE"
//       ],
//       dbDestIds: [
//         "ChIJmYOyFEsrK4gRM55wYvQ7Gk0",
//         "ChIJIyQg3tLT1IkREC-Km7nbODI",
//         "ChIJT8Sw6IPT1IkRi7kxtXUlIkU",
//         "ChIJ1xJ88TLU1IkRNnT_ycUGwdo",
//         "ChIJqwPrlk4rK4gR3Sp3QsgGbfE",
//         "ChIJrX94eCHV1IkRRtQJUOkCXfE"
//       ],
//       expect: false
//     },
//   ];

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       distanceModel = new Distance(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   for (let i = 0; i < ds.length; i++) {
//     it('should not has all placeIds', () => {
//       const d = ds[i];
//       const r = distanceModel.dbHasAllPlaceIds(d.destIds, d.dbDestIds);
//       expect(r).to.equal(d.expect);
//     });
//   }
// }); // end of dbHasAllPlaceIds

// // to enhance
// describe('distance loadRoadDistances', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let distanceModel: Distance;
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

//   let mall: IPlace = {
//     placeId: 'ChIJIyQg3tLT1IkREC-Km7nbODI',
//     lat: 43.7846771,
//     lng: -79.3011181
//   }

//   const ds = [
//     { origin: origin, destinations: [], expect: [] },
//     { origin: origin, destinations: [mall], expect: [
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
//       distanceModel = new Distance(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   for (let i = 0; i < ds.length; i++) {
//     it('should not has all placeIds', (done) => {
//       const d = ds[i];
//       distanceModel.loadRoadDistances(d.origin, d.destinations).then(r => {
//         expect(r.length).to.equal(d.expect.length);
//         done();
//       });
//     });
//   }
// }); // end of loadRoadDistances

