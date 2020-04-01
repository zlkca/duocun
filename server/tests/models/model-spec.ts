// import { Order } from "../../models/order";
// import { DB } from "../../db";
// import { expect } from 'chai';
// import { Config } from '../../config';
// import { ObjectID } from "mongodb";

// describe('groupBy', () => {
//   it('should return grouped orders', () => {
//     const db = new DB();
//     const c = new Order(db);

//     const orders: any[] = [
//       { id: 'a', clientId: 'a', groupDiscount: 1, total: 1 },
//       { id: 'b', clientId: 'a', groupDiscount: 2, total: 1 },
//       { id: 'c', clientId: 'a', groupDiscount: 0, total: 1 },
//       { id: 'd', clientId: 'b', groupDiscount: 0, total: 1 }, // take
//       { id: 'e', clientId: 'b', groupDiscount: 1, total: 3 }, // take
//       { id: 'f', clientId: 'c', groupDiscount: 0, total: 2 }, // take
//       { id: 'g', groupDiscount: 0, total: 2 },
//       { id: 'h', clientId: 'c', groupDiscount: 2 },
//       { id: 'i', clientId: 'd', groupDiscount: 0 }, // take
//       { id: 'j', price: 5 },
//       { id: 'k', clientId: 'd', groupDiscount: 0 },
//     ];

//     const a = c.groupBy(orders, 'clientId');

//     expect(a['a'].length).to.equal(3);
//     expect(a['b'].length).to.equal(2);
//     expect(a['c'].length).to.equal(2);
//     expect(a['d'].length).to.equal(2);
//   });
// });

// describe('find $in with strings', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let clientConnection: any = null;
//   let orderModel: Order;

//   before(function(done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       orderModel = new Order(db);
//       clientConnection = dbClient;
//       done();
//     });
//   });

//   after(function() {
//     clientConnection.close();
//   });

//   it('should return orders', (done) => {
//     const a = orderModel.find({_id: { $in: ['5cc06430a5270f48536c0376', '5cc090b1a5270f48536c037c']}}).then(os => {
//       expect(os.length).to.equal(2);
//       done();
//     });
//   });
// });


// describe('find $in with objectId', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let clientConnection: any = null;
//   let orderModel: Order;

//   before(function(done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       orderModel = new Order(db);
//       clientConnection = dbClient;
//       done();
//     });
//   });

//   after(function() {
//     clientConnection.close();
//   });

//   it('should return orders', (done) => {
//     const orderIds = [
//       new ObjectID('5cc06430a5270f48536c0376'),
//       new ObjectID('5cc090b1a5270f48536c037c'),
//     ]
//     const a = orderModel.find({_id: { $in: orderIds}}).then(os => {
//       expect(os.length).to.equal(2);
//       done();
//     });
//   });
// });

// // describe('find $ne', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let orderModel: Order;

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       orderModel = new Order(db);
// //       clientConnection = dbClient;
// //       done();
// //     });
// //   });

// //   after(function() {
// //     clientConnection.close();
// //   });

// //   it('should return orders', (done) => {
// //     const a = orderModel.find({status: { $ne: 'paid'}}).then(os => {
// //       expect(os.length).to.equal(604);
// //       done();
// //     });
// //   });
// // });



// // describe('distinct', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let orderModel: Order;

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       orderModel = new Order(db);
// //       clientConnection = dbClient;
// //       done();
// //     });
// //   });

// //   after(function() {
// //     clientConnection.close();
// //   });

// //   it('should return orders', (done) => {
// //     const a = orderModel.distinct('clientId', {status: { $nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP]}}).then(os => {
// //       expect(os.length).to.equal(361);
// //       done();
// //     });
// //   });
// // });