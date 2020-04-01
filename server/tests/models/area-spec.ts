// import { Area, IArea } from "../../models/area";
// import { DB } from "../../db";
// import { expect } from 'chai';
// import { Config } from "../../config";


// describe('area getNearestArea', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let areaModel: Area;
//   let connection: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       areaModel = new Area(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return Area C', (done) => {
//     const origin = {lat: 43.8515003, lng: -79.3823725}; // area 'C'
//     areaModel.getNearestArea(origin).then((area: IArea) => {
//       expect(area.code).to.equal('C');
//       done();
//     });
//   });

//   it('should return Area SC', (done) => {
//     const origin = {lat: 43.7747643, lng: -79.3369183}; // 275 yorkland 'North York'
//     areaModel.getNearestArea(origin).then((area: IArea) => {
//       expect(area.code).to.equal('SC');
//       done();
//     });
//   });

//   it('should return Area MA', (done) => {
//     const origin = {lat: 43.8876596, lng: -79.3443068}; // area 'Markham'
//     areaModel.getNearestArea(origin).then((area: IArea) => {
//       expect(area.code).to.equal('MA');
//       done();
//     });
//   });

//   it('should return Area NE', (done) => {
//     const origin = {lat: 43.9689172, lng: -79.477096}; // area 'aurora'
//     areaModel.getNearestArea(origin).then((area: IArea) => {
//       expect(area.code).to.equal('NE');
//       done();
//     });
//   });

//   it('should return Area RI', (done) => {
//     const origin = {lat: 43.8551284, lng: -79.48203319999999}; // area 'Vaughan'
//     areaModel.getNearestArea(origin).then((area: IArea) => {
//       expect(area.code).to.equal('RI');
//       done();
//     });
//   });

// }); // end of merchant joinFind
