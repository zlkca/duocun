// import { Order, OrderType } from "../../models/order";
// import { DB } from "../../db";
// import { expect } from 'chai';
// import moment from "moment";
// import { Config } from "../../config";
// import { IPhase } from "../../models/merchant";


// describe('getUTC', () => {
//   it('should return utc date time', () => {
//     const db = new DB();
//     const orderModel = new Order(db);
//     const phases: IPhase[] = [
//       {
//         orderEnd: '10:45',
//         pickup: '11:20'
//       },
//       {
//         orderEnd: '11:30',
//         pickup: '12:00'
//       },
//     ];

//     // utc time
//     const datas = [
//       { created: '2019-11-03T14:52:59.566Z', phases: phases, type: 'today', ret: '2019-11-03T16:20:00.000Z' },
//       { created: '2019-11-03T15:52:59.566Z', phases: phases, type: 'today', ret: '2019-11-03T16:20:00.000Z' },
//       { created: '2019-11-03T16:52:59.566Z', phases: phases, type: 'today', ret: '2019-11-03T16:20:00.000Z' },
//     ];

//     datas.map(d => {
//       const r: moment.Moment = orderModel.setLocalTime(moment(d.created), d.phases[0].pickup);
//       expect(r.toISOString()).to.equal(d.ret);
//     });

//   });
// });

// describe('getDeliveryDateTimeByPhase', () => {
//   it('should return delivered date time', () => {
//     const db = new DB();
//     const orderModel = new Order(db);
//     const phases: IPhase[] = [
//       {
//         orderEnd: '10:45',
//         pickup: '11:20'
//       },
//       {
//         orderEnd: '11:30',
//         pickup: '12:00'
//       },
//     ];

//     const datas = [
//       { created: '2019-11-03T03:52:59.566Z', phases: phases, type: 'tomorrow', ret: '2019-11-03T16:20:00.000Z' },
//       { created: '2019-11-03T15:52:59.566Z', phases: phases, type: 'today', ret: '2019-11-03T17:00:00.000Z' },
//       { created: '2019-11-03T16:52:59.566Z', phases: phases, type: 'today', ret: '2019-11-03T16:20:00.000Z' },
//     ];

//     datas.map(d => {
//       const r: string = orderModel.getDeliveryDateTimeByPhase(d.created, d.phases, d.type);
//       expect(r).to.equal(d.ret);
//     });

//   });
// });

// describe('getDeliveryDateTime', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let orderModel: Order;
//   let connection: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       orderModel = new Order(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return delivered date time string', (done) => {
//     const phases: IPhase[] = [
//       {
//         orderEnd: '10:45',
//         pickup: '11:20'
//       },
//       {
//         orderEnd: '11:30',
//         pickup: '12:00'
//       },
//     ];

//     // utc time
//     const datas = [
//       {
//         orderType: OrderType.FOOD_DELIVERY,
//         dateType: 'today',
//         clientId: '5dc463a7cb39ea565b0b634e',
//         phases: phases,
//         utcCreatedStr: '2019-12-10T15:25:16.210Z',
//         ret: '2019-12-10T16:20:00.000Z'
//       },
//     ];

//     datas.map(d => {
//       orderModel.getDeliveryDateTime(d.orderType, d.dateType, d.clientId, d.phases, d.utcCreatedStr).then(r => {
//         expect(r).to.equal(d.ret);
//         done();
//       });
//     });
//   });
// });


// describe('getDeliveryDateTime', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let orderModel: Order;
//   let connection: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       orderModel = new Order(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return delivered date time string without phases', (done) => {
//     const phases: IPhase[] = [];
//     const datas = [
//       {
//         orderType: OrderType.FOOD_DELIVERY,
//         dateType: 'today',
//         clientId: '5dc463a7cb39ea565b0b634e',
//         phases: phases,
//         utcCreatedStr: '2019-12-10T15:25:16.210Z',
//         ret: '2019-12-10T16:20:00.000Z'
//       },
//     ];

//     datas.map(d => {
//       orderModel.getDeliveryDateTime(d.orderType, d.dateType, d.clientId, d.phases, d.utcCreatedStr).then(r => {
//         // expect(r).to.equal(d.ret); // today's
//         done();
//       });
//     });
//   });
// });


// describe('order joinFind query id', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let orderModel: Order;
//   let connection: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       orderModel = new Order(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return an order', (done) => {
//     const _id = '5ccce16995e72c44a1d65113';

//     orderModel.joinFind({ '_id': _id }).then(rs => {
//       const orderId: any = rs[0]._id;
//       const client: any = rs[0].client;
//       const merchant: any = rs[0].merchant;
//       expect(rs.length).to.equal(1);
//       expect(orderId.toString().length).to.equal(24);
//       expect(client._id.toString()).to.equal(rs[0].clientId.toString());
//       expect(merchant._id.toString()).to.equal(rs[0].merchantId.toString());

//       done();
//     });
//   });
// }); // end of merchant joinFind


// function convertUTC() {
//   // console.log(moment('2019-04-23T15:45:00').utc().format());
//   // console.log('it is ' + moment.utc(moment('2019-04-23T10:45:00.000Z').local()).format());
//   // console.log(moment().utc().format());
//   var a = moment('2019-04-23T15:45:00'); //.tz('2019-04-23T15:45:00', 'YYYY-MM-DDThh:mm:ss', 'America/Toronto');
//   var b = moment.utc('2019-04-23T19:45:00');
//   // a.set({hour: 10, minute: 30});
//   console.log(a.toISOString());  // 2013-02-04T10:35:24-08:00
//   console.log(b.toISOString());  // 2013-02-04T18:35:24+00:00
//   console.log(moment('2019-04-23T15:45:00').local().format('YYYY-MM-DDTHH:mm:ss') + '.000Z');
// }
// // getDeliveryDateTimeByPhase(createdDateTime: string, phases: IPhase[], dateType: string): string {

// // import { Order } from '../../models/order';
// // import { Account } from '../../models/account';
// // import { ClientBalance } from '../../models/client-balance';

// // import { DB } from '../../db';
// // import { expect } from 'chai';
// // import { Config } from '../../config';
// // import moment from 'moment';

// // // // describe('getDistinctArray with missing field', () => {
// // // //   it('should return distinct Array', () => {
// // // //     const db = new DB();
// // // //     const c = new Order(db);

// // // //     const orders: any[] = [
// // // //       { cId: 'a', price: 1 },
// // // //       { cId: 'a', price: 2 },
// // // //       { cId: 'b', price: 3 },
// // // //       { price: 5 }
// // // //     ];

// // // //     const a = c.getDistinctArray(orders, 'cId');

// // // //     expect(a.length).to.equal(2);
// // // //     expect(a[0].price).to.equal(1);
// // // //     expect(a[1].cId).to.equal('b');
// // // //   });
// // // // });

// // // // describe('getDistinctArray with empty', () => {
// // // //   it('should return empty Array', () => {
// // // //     const db = new DB();
// // // //     const c = new Order(db);

// // // //     const orders: any[] = [];
// // // //     const a = c.getDistinctArray(orders, 'cId');

// // // //     expect(a.length).to.equal(0);
// // // //   });
// // // // });

// // describe('Order.getUpdatesForAddGroupDiscount with missing field', () => {
// //   it('should return orders to be updated', () => {
// //     const db = new DB();
// //     const c = new Order(db);

// //     const orders: any[] = [
// //       { _id: 'a', clientId: 'a', groupDiscount: 1, total: 1 },
// //       { _id: 'b', clientId: 'a', groupDiscount: 2, total: 1 },
// //       { _id: 'c', clientId: 'a', groupDiscount: 0, total: 1 },
// //       { _id: 'd', clientId: 'b', groupDiscount: 0, total: 1 }, // take
// //       { _id: 'e', clientId: 'b', groupDiscount: 0, total: 3 }, // take
// //       { _id: 'f', clientId: 'c', groupDiscount: 0, total: 2 }, // take
// //       { _id: 'g', groupDiscount: 0, total: 2 },
// //       { _id: 'h', clientId: 'c', groupDiscount: 2 },
// //       { _id: 'i', clientId: 'd', groupDiscount: 0, total: 3 }, // take
// //       { _id: 'j', price: 5 },
// //       { _id: 'k', clientId: 'd', groupDiscount: 0 },
// //     ];

// //     const a = c.getUpdatesForAddGroupDiscount(orders, 2);

// //     expect(a.length).to.equal(2);

// //     for (let i = 0; i < a.length; i++) {
// //       expect(a[i].data.groupDiscount).to.equal(2);
// //     }
// //     expect(a[0].data.total).to.equal(-1);
// //     expect(a[1].data.total).to.equal(1);
// //   });
// // });

// // describe('Order.getUpdatesForAddGroupDiscount with empty', () => {
// //   it('should return empty Array', () => {
// //     const db = new DB();
// //     const c = new Order(db);

// //     const orders: any[] = [];
// //     const a = c.getUpdatesForAddGroupDiscount(orders, 3);

// //     expect(a.length).to.equal(0);
// //   });
// // });


// // describe('getUpdatesForRemoveGroupDiscount, still be eligible and removed an order without discount', () => {
// //   it('should return orders to be updated', () => {
// //     const db = new DB();
// //     const c = new Order(db);

// //     const orders: any[] = [
// //       // { _id: 'a', clientId: 'a', groupDiscount: 0, total: 1 },
// //       { _id: 'b', clientId: 'a', groupDiscount: 2, total: 1 },
// //       { _id: 'c', clientId: 'a', groupDiscount: 0, total: 1 },
// //       { _id: 'd', clientId: 'b', groupDiscount: 2, total: 1 }, // take
// //       { _id: 'e', clientId: 'b', groupDiscount: 0, total: 3 }, // take
// //       { _id: 'f', clientId: 'c', groupDiscount: 0, total: 2 }, // take
// //       { _id: 'g', groupDiscount: 0, total: 2 },
// //       { _id: 'h', clientId: 'c', groupDiscount: 2, total: 4 },
// //       { _id: 'i', clientId: 'd', groupDiscount: 0, total: 3 }, // take
// //       { _id: 'j', price: 5 },
// //       { _id: 'k', clientId: 'd', groupDiscount: 2 },
// //     ];

// //     const a = c.getUpdatesForRemoveGroupDiscount(orders, 2);

// //     expect(a.length).to.equal(0);
// //   });
// // });

// // describe('getUpdatesForRemoveGroupDiscount, still be eligible and removed an order with discount', () => {
// //   it('should return orders to be updated', () => {
// //     const db = new DB();
// //     const c = new Order(db);

// //     const orders: any[] = [
// //       { _id: 'a', clientId: 'a', groupDiscount: 0, total: 1 },
// //       { _id: 'b', clientId: 'a', groupDiscount: 0, total: 2 },
// //       // { _id: 'c', clientId: 'a', groupDiscount: 2, total: 3 },
// //       { _id: 'c', clientId: 'b', groupDiscount: 0, total: 1 },
// //       { _id: 'c', clientId: 'b', groupDiscount: 2, total: 1 },
// //     ];

// //     const a = c.getUpdatesForRemoveGroupDiscount(orders, 2);

// //     expect(a.length).to.equal(1);
// //     expect(a[0].data.groupDiscount).to.equal(2);
// //     expect(a[0].data.total).to.equal(-1);
// //   });
// // });

// // describe('getUpdatesForRemoveGroupDiscount, not eligible and left 2 other orders', () => {
// //   it('should return orders to be updated', () => {
// //     const db = new DB();
// //     const c = new Order(db);

// //     const orders: any[] = [
// //       // { _id: 'a', clientId: 'a', groupDiscount: 2, total: 1 },
// //       { _id: 'c', clientId: 'b', groupDiscount: 0, total: 1 },
// //       { _id: 'c', clientId: 'b', groupDiscount: 2, total: 1 },
// //     ];

// //     const a = c.getUpdatesForRemoveGroupDiscount(orders, 2);

// //     expect(a.length).to.equal(1);
// //     expect(a[0].data.groupDiscount).to.equal(0);
// //     expect(a[0].data.total).to.equal(3);
// //   });
// // });

// // describe('getUpdatesForRemoveGroupDiscount, not eligible and left only one order', () => {
// //   it('should return orders to be updated', () => {
// //     const db = new DB();
// //     const c = new Order(db);
// //     const orders: any[] = [
// //       // { _id: 'a', clientId: 'a', groupDiscount: 2, total: 1 },
// //       { _id: 'c', clientId: 'b', groupDiscount: 2, total: 1 },
// //     ];

// //     const a = c.getUpdatesForRemoveGroupDiscount(orders, 2);

// //     expect(a.length).to.equal(1);
// //     expect(a[0].data.groupDiscount).to.equal(0);
// //     expect(a[0].data.total).to.equal(3);
// //   });
// // });

// // describe('getUpdatesForRemoveGroupDiscount with empty', () => {
// //   it('should return empty Array', () => {
// //     const db = new DB();
// //     const c = new Order(db);

// //     const orders: any[] = [];
// //     const a = c.getUpdatesForRemoveGroupDiscount(orders, 3);

// //     expect(a.length).to.equal(0);
// //   });
// // });



// // // (clientId: ObjectID, date: string, address: string, cb?: any)
// // describe('Order.addGroupDiscounts with 2nd groupDiscount 2', () => {
// //   const db: any = new DB();
// //   const clientConnection: any = null;
// //   const cfg: any = new Config();
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' },
// //     { username: 'li2', mode: 'test' },
// //     { username: 'li3', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       this.clientConnection = dbClient;
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;

// //         orders = [
// //           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
// //             groupDiscount: 0, total:8.5, paymentMethod: PaymentMethod.CASH },
// //           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
// //             groupDiscount: 2, total:9.5, paymentMethod: PaymentMethod.CASH },
// //         ];

// //         // const order = {clientId:c, delivered:x, address:y, groupDiscount: z};
// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = [];
// //     const orderIds: any[] = [
// //       {_id: ors[0]._id.toString()},
// //       {_id: ors[1]._id.toString()}
// //     ];
// //     acs.map(r => { accountIds.push({ _id: r._id.toString() }) });
// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(3);

// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(2);

// //         this.clientConnection.close( () => {
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   it('should update orders with group discount', (done) => {
// //     const order: any = ors[0];
// //     oo.addGroupDiscounts(order.clientId, ors).then((orderUpdates: any[]) => {
// //       const cIds: string[] = [];
// //       orders.map((o: any) => {
// //         cIds.push(o.clientId);
// //       });
// //         oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
// //           const order0 = o1s.find((x:any) => x.clientId.toString() === orders[0].clientId.toString());
// //           const order1 = o1s.find((x:any) => x.clientId.toString() === orders[1].clientId.toString());
// //           expect(order0.groupDiscount).to.equal(0); // got groupDiscount from front end
// //           expect(order0.total).to.equal(8.5); // got groupDiscount from front end already
// //           expect(order1.groupDiscount).to.equal(2);
// //           expect(order1.total).to.equal(9.5);
// //           done();
// //         });
// //     });
// //   });
// // });

// // // (clientId: string, date: string, address: string, cb?: any)
// // describe('Order.addGroupDiscounts with 2nd 0 groupDiscount', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' },
// //     { username: 'li2', mode: 'test' },
// //     { username: 'li3', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       clientConnection = dbClient;
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         orders = [
// //           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
// //           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:9.5 },
// //         ];

// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = [];
// //     const orderIds: any[] = [
// //       {_id: ors[0]._id.toString()},
// //       {_id: ors[1]._id.toString()}
// //     ];
// //     acs.map(r => { accountIds.push({ _id: r._id.toString() }) });
// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(3);

// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(2);

// //         clientConnection.close();
// //         done();
// //       });
// //     });
// //   });

// //   it('should update orders with group discount', (done) => {
// //     const order: any = ors[0];
// //     oo.addGroupDiscounts(order.clientId, ors).then( (orderUpdates: any[]) => {
// //       const cIds: string[] = [];
// //       orders.map((o: any) => { cIds.push(o.clientId); });

// //       if(orderUpdates && orderUpdates.length>0){
// //         oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
// //           const order0 = o1s.find((x:any) => x.clientId.toString() === orders[0].clientId.toString());
// //           const order1 = o1s.find((x:any) => x.clientId.toString() === orders[1].clientId.toString());
// //           expect(order0.groupDiscount).to.equal(0); // got groupDiscount from front end
// //           expect(order0.total).to.equal(8.5); // got groupDiscount from front end already
// //           expect(order1.groupDiscount).to.equal(2);
// //           expect(order1.total).to.equal(7.5);

// //           done();
// //         });
// //       } else { // this test never goes here
// //         oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
// //           const order0 = o1s.find((x:any) => x.clientId.toString() === orders[0].clientId.toString());
// //           const order1 = o1s.find((x:any) => x.clientId.toString() === orders[1].clientId.toString());
// //           expect(order0.groupDiscount).to.equal(0); // got groupDiscount from front end
// //           expect(order0.total).to.equal(8.5); // got groupDiscount from front end already
// //           expect(order1.groupDiscount).to.equal(0);
// //           expect(order1.total).to.equal(9.5);

// //           done();
// //         });
// //       }
// //     });
// //   });
// // });

// // // (clientId: string, date: string, address: string, cb?: any)
// // describe('Order.addGroupDiscounts with 2nd 1 groupDiscount', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' },
// //     { username: 'li2', mode: 'test' },
// //     { username: 'li3', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;

// //         orders = [
// //           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
// //           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 1, total:9.5 },
// //         ];

// //         // const order = {clientId:c, delivered:x, address:y, groupDiscount: z};
// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = [];
// //     const orderIds: any[] = [
// //       {_id: ors[0]._id.toString()},
// //       {_id: ors[1]._id.toString()}
// //     ];
// //     acs.map(r => { accountIds.push({ _id: r._id.toString() }) });
// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(3);

// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(2);
// //         done();
// //       });
// //     });
// //   });

// //   it('should update orders with group discount', (done) => {
// //     const order: any = ors[0];
// //     oo.addGroupDiscounts(order.clientId, ors).then((x: any) => {
// //       const cIds: string[] = [];
// //       orders.map((o: any) => {
// //         cIds.push(o.clientId);
// //       });

// //       oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
// //         const order0 = o1s.find((x:any) => x.clientId.toString() === orders[0].clientId.toString());
// //         const order1 = o1s.find((x:any) => x.clientId.toString() === orders[1].clientId.toString());
// //         expect(order0.groupDiscount).to.equal(0); // got groupDiscount from front end
// //         expect(order0.total).to.equal(8.5); // got groupDiscount from front end already
// //         expect(order1.groupDiscount).to.equal(1);
// //         expect(order1.total).to.equal(9.5);

// //         done();
// //       });

// //     });
// //   });
// // });

// // // describe('Order.removeGroupDiscounts', () => {
// // //   const db: any = new DB();
// // //   const cfg: any = new Config();
// // //   let clientConnection: any = null;
// // //   let oo: Order;
// // //   let ao: Account;
// // //   let acs: any[];
// // //   let ors: any[];
// // //   let orders: any[];
// // //   const accounts: any[] = [
// // //     { username: 'li1', mode: 'test' },
// // //     { username: 'li2', mode: 'test' },
// // //     { username: 'li3', mode: 'test' }
// // //   ];

// // //   before(function(done) {
// // //     db.init(cfg.DATABASE).then((dbClient: any) => {
// // //       oo = new Order(db);
// // //       ao = new Account(db);
// // //       clientConnection = dbClient;

// // //       ao.insertMany(accounts).then((rs: any[]) => {
// // //         acs = rs;
// // //         orders = [
// // //           // { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
// // //           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
// // //         ];

// // //         // const order = {clientId:c, delivered:x, address:y, groupDiscount: z};
// // //         oo.insertMany(orders).then((os: any[]) => {
// // //           ors = os;
// // //           done();
// // //         });
// // //       });
// // //     });
// // //   });

// // //   after(function(done) {
// // //     const accountIds: any[] = [];
// // //     const orderIds: any[] = [
// // //       {_id: ors[0]._id.toString()}
// // //     ];
// // //     acs.map(r => { accountIds.push({ _id: r._id.toString() }) });

// // //     ao.bulkDelete(accountIds).then((y: any) => {
// // //       expect(y.deletedCount).to.equal(3);
// // //       oo.bulkDelete(orderIds).then((y2: any) => {
// // //         expect(y2.deletedCount).to.equal(1);
// // //         clientConnection.close();
// // //         done();
// // //       });
// // //     });
// // //   });

// // //   it('should update orders with group discount', (done) => {
// // //     oo.removeGroupDiscounts(ors).then((orderUpdates: any[]) => {
// // //       const cIds: string[] = [];
// // //       orders.map((o: any) => {
// // //         cIds.push(o.clientId);
// // //       });
// // //       if(orderUpdates && orderUpdates.length>0){
// // //         oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
// // //           const order0 = o1s.find((x:any) => x.clientId.toString() === orders[0].clientId.toString());
// // //           expect(order0.groupDiscount).to.equal(0); // got groupDiscount from front end
// // //           expect(order0.total).to.equal(11.5); // got groupDiscount from front end already
// // //           done();
// // //         });
// // //       } else { // this test never goes here
// // //         oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
// // //           const order0 = o1s.find((x:any) => x.clientId.toString() === orders[0].clientId.toString());
// // //           expect(order0.groupDiscount).to.equal(0); // got groupDiscount from front end
// // //           expect(order0.total).to.equal(11.5); // got groupDiscount from front end already
// // //           done();
// // //         });
// // //       }
// // //     });
// // //   });
// // // });


// // describe('eligibleForGroupDiscount with 2 orders different accounts', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' },
// //     { username: 'li2', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       clientConnection = dbClient;
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         const cId0 = rs[0]._id.toString();
// //         const cId1 = rs[1]._id.toString();
// //         const dt = moment().set({ hour: 11, minute: 20, second: 0, millisecond: 0 }).toISOString();

// //         orders = [
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt, groupDiscount: 0, total:8.5 },
// //           { mode: 'test', clientId: cId1, clientName: rs[1].username, address:'abc', delivered: dt, groupDiscount: 1, total:9.5 },
// //         ];

// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = acs.map(r => {
// //       return { _id: r._id.toString()}
// //     });
// //     const orderIds: any[] = ors.map(r => {
// //       return { _id: r._id.toString()}
// //     });

// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(2);
// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(2);
// //         clientConnection.close();
// //         done();
// //       });
// //     });
// //   });

// //   it('should be eligible for the group discount', (done) => {
// //     const o1: any = ors[0];
// //     const o2: any = ors[1];

// //     oo.eligibleForGroupDiscount(o1.clientId.toString(), 'merchantId', 'today', o1.address).then((bEligible1: boolean) => {
// //       expect(bEligible1).to.equal(true);

// //       oo.eligibleForGroupDiscount(o2.clientId.toString(), 'merchantId', 'today', o2.address).then((bEligible1: boolean) => {
// //         expect(bEligible1).to.equal(false);
// //         done();
// //       });
// //     });
// //   });

// // });



// // describe('eligibleForGroupDiscount with 1 orders different accounts', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' },
// //     { username: 'li2', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       clientConnection = dbClient;
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         const cId0 = rs[0]._id.toString();
// //         const dt = moment().set({ hour: 11, minute: 20, second: 0, millisecond: 0 }).toISOString();

// //         orders = [
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt, groupDiscount: 0, total:8.5 },
// //         ];

// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = acs.map(r => {
// //       return { _id: r._id.toString()}
// //     });
// //     const orderIds: any[] = ors.map(r => {
// //       return { _id: r._id.toString()}
// //     });

// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(2);

// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(1);
// //         clientConnection.close();
// //         done();
// //       });
// //     });
// //   });

// //   it('should be eligible for the group discount', (done) => {
// //     const o1: any = ors[0];
// //     oo.eligibleForGroupDiscount(acs[1]._id.toString(), 'merchantId', 'today', o1.address).then((bEligible1: boolean) => {
// //       expect(bEligible1).to.equal(true);
// //       done();
// //     });
// //   });
// // });

// // describe('eligibleForGroupDiscount with 1 orders same accounts', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       clientConnection = dbClient;
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         const cId0 = rs[0]._id.toString();
// //         const dt = moment().set({ hour: 11, minute: 20, second: 0, millisecond: 0 }).toISOString();

// //         orders = [
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt, groupDiscount: 0, total:8.5 },
// //         ];

// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = acs.map(r => {
// //       return { _id: r._id.toString()}
// //     });
// //     const orderIds: any[] = ors.map(r => {
// //       return { _id: r._id.toString()}
// //     });

// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(1);

// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(1);
// //         clientConnection.close();
// //         done();
// //       });
// //     });
// //   });

// //   it('should be eligible for the group discount', (done) => {
// //     const o1: any = ors[0];
// //     oo.eligibleForGroupDiscount(acs[0]._id.toString(), 'merchantId', 'today', o1.address).then((bEligible1: boolean) => {
// //       expect(bEligible1).to.equal(false);
// //       done();
// //     });
// //   });
// // });


// // describe('eligibleForGroupDiscount with multiple orders of the same accounts', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       clientConnection = dbClient;
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         const cId0 = rs[0]._id.toString();
// //         const dt = moment().set({ hour: 11, minute: 20, second: 0, millisecond: 0 }).toISOString();

// //         orders = [
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt, groupDiscount: 0, total:8.5 },
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt, groupDiscount: 0, total:9.5 },
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt, groupDiscount: 0, total:7.5 },
// //         ];

// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = acs.map(r => {
// //       return { _id: r._id.toString()}
// //     });
// //     const orderIds: any[] = ors.map(r => {
// //       return { _id: r._id.toString()}
// //     });

// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(1);
// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(3);
// //         clientConnection.close();
// //         done();
// //       });
// //     });
// //   });

// //   it('should be eligible for the group discount', (done) => {
// //     const o1: any = ors[0];
// //     oo.eligibleForGroupDiscount(acs[0]._id.toString(), 'merchantId', 'today', o1.address).then((bEligible1: boolean) => {
// //       expect(bEligible1).to.equal(false);
// //       done();
// //     });
// //   });
// // });

// // describe('eligibleForGroupDiscount with 2 orders of the different time in same day', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' },
// //     { username: 'li2', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       clientConnection = dbClient;
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         const cId0 = rs[0]._id.toString();
// //         const cId1 = rs[1]._id.toString();
// //         const dt0 = moment().set({ hour: 11, minute: 20, second: 0, millisecond: 0 }).toISOString();
// //         const dt1 = moment().set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toISOString();

// //         orders = [
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt0, groupDiscount: 0, total:8.5 },
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt0, groupDiscount: 0, total:9.5 },
// //           { mode: 'test', clientId: cId1, clientName: rs[0].username, address:'abc', delivered: dt1, groupDiscount: 0, total:7.5 },
// //         ];

// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = acs.map(r => {
// //       return { _id: r._id.toString()}
// //     });
// //     const orderIds: any[] = ors.map(r => {
// //       return { _id: r._id.toString()}
// //     });

// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(2);
// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(3);
// //         clientConnection.close();
// //         done();
// //       });
// //     });
// //   });

// //   it('should be eligible for the group discount', (done) => {
// //     const o1: any = ors[0];
// //     oo.eligibleForGroupDiscount(acs[0]._id.toString(), 'merchantId', 'today', o1.address).then((bEligible1: boolean) => {
// //       expect(bEligible1).to.equal(true);
// //       done();
// //     });
// //   });
// // });


// // describe('eligibleForGroupDiscount with 2 orders of the same accounts - already discount', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' },
// //     { username: 'li2', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       clientConnection = dbClient;
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         const cId0 = rs[0]._id.toString();
// //         const cId1 = rs[1]._id.toString();
// //         const dt0 = moment().set({ hour: 11, minute: 20, second: 0, millisecond: 0 }).toISOString();
// //         const dt1 = moment().set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toISOString();

// //         orders = [
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt0, groupDiscount: 0, total:8.5 },
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt0, groupDiscount: 2, total:9.5 },
// //           { mode: 'test', clientId: cId1, clientName: rs[0].username, address:'abc', delivered: dt1, groupDiscount: 2, total:7.5 },
// //         ];

// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = acs.map(r => {
// //       return { _id: r._id.toString()}
// //     });
// //     const orderIds: any[] = ors.map(r => {
// //       return { _id: r._id.toString()}
// //     });

// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(2);
// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(3);
// //         clientConnection.close();
// //         done();
// //       });
// //     });
// //   });

// //   it('should be eligible for the group discount', (done) => {
// //     const o1: any = ors[0];
// //     oo.eligibleForGroupDiscount(acs[0]._id.toString(), 'merchantId', 'today', o1.address).then((bEligible1: boolean) => {
// //       expect(bEligible1).to.equal(false);
// //       done();
// //     });
// //   });

// // });


// // describe('eligibleForGroupDiscount with 2 orders of the different accounts - no discount', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let acs: any[];
// //   let ors: any[];
// //   let orders: any[];
// //   const accounts: any[] = [
// //     { username: 'li1', mode: 'test' },
// //     { username: 'li2', mode: 'test' }
// //   ];

// //   before(function(done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       clientConnection = dbClient;
// //       oo = new Order(db);
// //       ao = new Account(db);

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         const cId0 = rs[0]._id.toString();
// //         const cId1 = rs[1]._id.toString();
// //         const dt0 = moment().set({ hour: 11, minute: 20, second: 0, millisecond: 0 }).toISOString();
// //         const dt1 = moment().set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toISOString();

// //         orders = [
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt0, groupDiscount: 0, total:8.5 },
// //           { mode: 'test', clientId: cId0, clientName: rs[0].username, address:'abc', delivered: dt0, groupDiscount: 0, total:9.5 },
// //           { mode: 'test', clientId: cId1, clientName: rs[0].username, address:'abc', delivered: dt1, groupDiscount: 2, total:7.5 },
// //         ];

// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = acs.map(r => {
// //       return { _id: r._id.toString()}
// //     });
// //     const orderIds: any[] = ors.map(r => {
// //       return { _id: r._id.toString()}
// //     });

// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(2);
// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(3);
// //         clientConnection.close();
// //         done();
// //       });
// //     });
// //   });

// //   it('should be eligible for the group discount', (done) => {
// //     const o1: any = ors[0];
// //     oo.eligibleForGroupDiscount(acs[0]._id.toString(), 'merchantId', 'today', o1.address).then((bEligible1: boolean) => {
// //       expect(bEligible1).to.equal(true);
// //       done();
// //     });
// //   });

// // });

// // // // // insertMany, bulkUpdate and bulkDelete
// // // // describe('insertMany and bulkDelete with items', () => {
// // // //   it('should return empty Array', () => {
// // // //     const db = new DB();
// // // //     const cfg = new Config();
// // // //     db.init(cfg.DATABASE).then(dbClient => {
// // // //       const c = new Order(db);
// // // //       const orders: any[] = [{ name: 'aa11' }, { name: 'bb22' }, { name: 'cc33' }];
// // // //       c.insertMany(orders).then(rs => {
// // // //         expect(rs.length).to.equal(3);
// // // //         expect(rs[0].name).to.equal('aa11');
// // // //         expect(rs[1].name).to.equal('bb22');
// // // //         expect(rs[2].name).to.equal('cc33');
// // // //         expect(typeof rs[0].id).to.equal('object');

// // // //         const updates: any[] = [];
// // // //         let i = 0;
// // // //         rs.map((r: any) => {
// // // //           updates.push({ query: { id: r.id }, data: { name: 'eee' + i, price: i } });
// // // //           i++;
// // // //         })
// // // //         c.bulkUpdate(updates).then((ret1: BulkWriteOpResultObject) => {
// // // //           expect(ret1.modifiedCount).to.equal(3);
// // // //           const ids = [rs[0].id.toString(), rs[1].id.toString(), rs[2].id.toString()]
// // // //           c.find({ id: { $in: ids } }).then(docs => {
// // // //             expect(docs.length).to.equal(3);
// // // //             expect(docs[0].name).to.equal('eee0');

// // // //             const queries: any[] = [];
// // // //             rs.map((r: any) => {
// // // //               queries.push({ id: r.id });
// // // //             })

// // // //             c.bulkDelete(queries).then((ret2: any) => {
// // // //               expect(ret2.nRemoved).to.equal(3);
// // // //             }, err2 => {
// // // //               console.log('bulkDelete exception');
// // // //             });
// // // //           });
// // // //           // expect(rs[0].name).to.equal('eee0');
// // // //           // expect(rs[1].name).to.equal('eee1');
// // // //           // expect(rs[2].name).to.equal('eee2');
// // // //           // expect(rs[0].price).to.equal(0);
// // // //           // expect(rs[1].price).to.equal(1);
// // // //           // expect(rs[2].price).to.equal(2);


// // // //         }, err1 => {
// // // //           console.log('bulkUpdate exception');
// // // //         });

// // // //       }, err => {
// // // //         console.log('insertMany exception');
// // // //       });
// // // //     });
// // // //   });
// // // // });

// // // // //---------------------------------------------------------------------
// // // // // The client has to have the balance entry {accountId: x, amount: y}
// // // // // body --- {clientId:c, delivered:x, address:y, groupDiscount: z}
// // // // // createOne(body: any, cb: any){
// // // // describe('order.createOne', () => {
// // // //   it('should create order and update balance', () => {
// // // //     const db = new DB();
// // // //     const cfg = new Config();
// // // //     db.init(cfg.DATABASE).then(dbClient => {
// // // //       const c = new Order(db);
// // // //       const ac = new Account(db);
// // // //       const bc = new ClientBalance(db);

// // // //       const accounts: any[] = [
// // // //         { username: 'li1', mode: 'test' },
// // // //         { username: 'li2', mode: 'test' },
// // // //         { username: 'li3', mode: 'test' }
// // // //       ];

// // // //       ac.insertMany(accounts).then((rs: any[]) => {
// // // //         for(let i=0; i< accounts.length; i++){
// // // //           expect(rs[i].username).to.equal(accounts[i].username);
// // // //         }

// // // //         const balances: any[] = [
// // // //           { accountId: rs[0].id.toString(), accountName: rs[0].username, amount: -5 },
// // // //           { accountId: rs[1].id.toString(), accountName: rs[1].username, amount: 0 },
// // // //           { accountId: rs[2].id.toString(), accountName: rs[2].username, amount: 5 },
// // // //         ];

// // // //         bc.insertMany(balances).then((bs: any[]) => {
// // // //           for(let i=0; i<bs.length; i++){
// // // //             expect(bs[i].accountName).to.equal(accounts[i].username);
// // // //           }

// // // //           const orders: any[] = [
// // // //             { clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
// // // //             { clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
// // // //           ];

// // // //           // const order = {clientId:c, delivered:x, address:y, groupDiscount: z};
// // // //           c.createOne(orders[0], (order0: any) => {
// // // //             expect(order0.groupDiscount).to.equal(0);
// // // //             c.createOne(orders[1], (order1: any) => {
// // // //               expect(order1.groupDiscount).to.equal(2); // got groupDiscount from front end
// // // //               expect(order1.total).to.equal(9.5); // got groupDiscount from front end already

// // // //               c.find({id: order0.id.toString()}).then(newOrders => {
// // // //                 expect(newOrders[0].groupDiscount).to.equal(2);
// // // //                 expect(newOrders[0].total).to.equal(6.5);
// // // //               });

// // // //               bc.find({accountId: {$in: [rs[0].id.toString(), rs[1].id.toString()]}}).then(rets => {
// // // //                 expect(rets[0].amount).to.equal(-3);
// // // //                 expect(rets[1].amount).to.equal(0); // update balance from Front end!!! because of credit card and wechat pay.

// // // //                 // recover
// // // //                 const accountIds: any[] = [];
// // // //                 const balanceIds: any[] = [];
// // // //                 const orderIds: any[] = [
// // // //                   {id: order0.id.toString()},
// // // //                   {id: order1.id.toString()}
// // // //                 ];
// // // //                 rs.map(r => { accountIds.push({ id: r.id.toString() }) });
// // // //                 bs.map(b => { balanceIds.push({ id: b.id.toString() }) });
// // // //                 ac.bulkDelete(accountIds).then((y: any) => {
// // // //                   expect(y.deletedCount).to.equal(3);

// // // //                   bc.bulkDelete(balanceIds).then((y1: any) => {
// // // //                     expect(y1.deletedCount).to.equal(3);

// // // //                     c.bulkDelete(orderIds).then(y2 => {
// // // //                       expect(y2.deletedCount).to.equal(2);
// // // //                     });
// // // //                   });
// // // //                 });
// // // //               });



// // // //             });
// // // //           });


// // // //         });

// // // //       });
// // // //     });
// // // //   });
// // // // });


// // // // describe('order.createOne', () => {
// // // //   it('should create order and update balance', () => {
// // // //     const db = new DB();
// // // //     const cfg = new Config();
// // // //     db.init(cfg.DATABASE).then(dbClient => {
// // // //       const c = new Order(db);
// // // //       const ac = new Account(db);
// // // //       const bc = new ClientBalance(db);

// // // //       const account = { username: 'li1' };

// // // //       const orders: any[] = [
// // // //         { name: 'aa11' },
// // // //         { name: 'bb22' }, { name: 'cc33' }];

// // // //       ac.insertOne(account).then((x: any) => {
// // // //         expect(x.name).to.equal('li1');
// // // //         const balance = { accountId: x.id.toString(), accountName: 'li1', amount: 0 };
// // // //         bc.insertOne(balance).then((b: any) => {
// // // //           // const order = {clientId:c, delivered:x, address:y, groupDiscount: z};
// // // //           // c.createOne(body: any, cb: any){

// // // //           ac.deleteById(x.id.toString()).then((y: any) => {
// // // //             expect(y.deletedCount).to.equal(1);

// // // //             bc.deleteById(b.id.toString()).then((y1: any) => {
// // // //               expect(y1.deletedCount).to.equal(1);
// // // //             });
// // // //           });
// // // //         });

// // // //       });
// // // //     });
// // // //   });
// // // // });

// // // // // insertMany
// // // // describe('insertMany with empty', () => {
// // // //   it('should return empty Array', () => {
// // // //     const db = new DB();
// // // //     const c = new Order(db);

// // // //     const orders: any[] = [];
// // // //     c.insertMany(orders).then(rs => {
// // // //       expect(rs.length).to.equal(0);
// // // //     });
// // // //   });
// // // });
