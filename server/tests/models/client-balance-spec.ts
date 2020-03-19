// import { Order, IOrder } from '../../models/order';
// import { Account } from '../../models/account';
// import { ClientBalance, IClientBalance } from '../../models/client-balance';

// import { DB } from '../../db';
// import { expect } from 'chai';
// import { Config } from '../../config';
// import { ObjectID } from 'mongodb';

// // describe('getMyBalanceForAddOrder', () => {
// //   it('should return correct balance', () => {
// //     const db = new DB();
// //     const cbo = new ClientBalance(db);

// //     const params: any[] = [
// //       // prepaid
// //       { balance: 15.56, paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: 6.06 },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: -3.94 },
// //       { balance: 0,     paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: -9.5 },
// //       { balance: -5.56, paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: -15.06 },
// //       { balance: -15.56,paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: -25.06 },
// //       // cash
// //       { balance: 15.56, paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: 6.06 },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: -3.94 },
// //       { balance: 0,     paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: -9.5 },
// //       { balance: -5.56, paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: -15.06 },
// //       { balance: -15.56,paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: -25.06 },

// //       { balance: 15.56, paymentMethod: PaymentMethod.CASH, bPaid: true, payable: 9.5, paid: 30, expected: 36.06 },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.CASH, bPaid: true, payable: 9.5, paid: 30, expected: 26.06 },
// //       { balance: 0,     paymentMethod: PaymentMethod.CASH, bPaid: true, payable: 9.5, paid: 30, expected: 20.5 },
// //       { balance: -5.56, paymentMethod: PaymentMethod.CASH, bPaid: true, payable: 9.5, paid: 30, expected: 14.94 },
// //       { balance: -15.56,paymentMethod: PaymentMethod.CASH, bPaid: true, payable: 9.5, paid: 30, expected: 4.94 },
// //       // card
// //       { balance: 15.56, paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: false, payable: 9.5, expected: null },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: false, payable: 9.5, expected: null },
// //       { balance: 0,     paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: false, payable: 9.5, expected: null },
// //       { balance: -5.56, paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: false, payable: 9.5, expected: null },
// //       { balance: -15.56,paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: false, payable: 9.5, expected: null },

// //       { balance: 15.56, paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: 36.06 },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: 26.06 },
// //       { balance: 0,     paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: 20.5 },
// //       { balance: -5.56, paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: 14.94 },
// //       { balance: -15.56,paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: 4.94 },

// //       // wechat
// //       { balance: 15.56, paymentMethod: PaymentMethod.WECHAT, bPaid: false, payable: 9.5, expected: null },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.WECHAT, bPaid: false, payable: 9.5, expected: null },
// //       { balance: 0,     paymentMethod: PaymentMethod.WECHAT, bPaid: false, payable: 9.5, expected: null },
// //       { balance: -5.56, paymentMethod: PaymentMethod.WECHAT, bPaid: false, payable: 9.5, expected: null },
// //       { balance: -15.56,paymentMethod: PaymentMethod.WECHAT, bPaid: false, payable: 9.5, expected: null },

// //       { balance: 15.56, paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: 36.06 },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: 26.06 },
// //       { balance: 0,     paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: 20.5 },
// //       { balance: -5.56, paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: 14.94 },
// //       { balance: -15.56,paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: 4.94 },
// //     ];

// //     params.map(p => {
// //       const b = cbo.getMyBalanceForAddOrder(p.balance, p.paymentMethod, p.bPaid, p.payable, p.paid);
// //       expect(b).to.equal(p.expected);
// //     });
// //   });
// // });

// // describe('getMyBalanceForRemoveOrder', () => {
// //   it('should return correct balance', () => {
// //     const db = new DB();
// //     const cbo = new ClientBalance(db);

// //     const params: any[] = [
// //       // prepaid
// //       { balance: 15.56, paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: 25.06 },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: 15.06 },
// //       { balance: 0,     paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: 9.5 },
// //       { balance: -5.56, paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: 3.94 },
// //       { balance: -15.56,paymentMethod: PaymentMethod.PREPAY, bPaid: false, payable: 9.5, expected: -6.06 },
// //       // cash
// //       { balance: 15.56, paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: 25.06 },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: 15.06 },
// //       { balance: 0,     paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: 9.5 },
// //       { balance: -5.56, paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: 3.94 },
// //       { balance: -15.56,paymentMethod: PaymentMethod.CASH, bPaid: false, payable: 9.5, expected: -6.06 },
// //       // card
// //       { balance: 15.56, paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: 25.06 },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: 15.06 },
// //       { balance: 0,     paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: 9.5 },
// //       { balance: -5.56, paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: 3.94 },
// //       { balance: -15.56,paymentMethod: PaymentMethod.CREDIT_CARD, bPaid: true, payable: 9.5, paid: 30, expected: -6.06 },

// //       // wechat
// //       { balance: 15.56, paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: 25.06 },
// //       { balance: 5.56,  paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: 15.06 },
// //       { balance: 0,     paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: 9.5 },
// //       { balance: -5.56, paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: 3.94 },
// //       { balance: -15.56,paymentMethod: PaymentMethod.WECHAT, bPaid: true, payable: 9.5, paid: 30, expected: -6.06 },
// //     ];

// //     params.map(p => {
// //       const b = cbo.getMyBalanceForRemoveOrder(p.balance, p.paymentMethod, p.payable);
// //       expect(b).to.equal(p.expected);
// //     });
// //   });
// // });


// describe('ClientBalance.getUpdatesForAddGroupDiscount with missing field', () => {
//   it('should return orders to be updated', () => {
//     const db = new DB();
//     const cbo = new ClientBalance(db);

//     const orders: IOrder[] = [
//       { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 1, total:1, paymentMethod: PaymentMethod.CASH },
//       { mode: 'test', clientId: 'b', clientName: 'b', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:1, paymentMethod: PaymentMethod.CASH },
//       { mode: 'test', clientId: 'c', clientName: 'c', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:1, paymentMethod: PaymentMethod.CASH },
//       { mode: 'test', clientId: 'd', clientName: 'd', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:1, paymentMethod: PaymentMethod.CASH },
//     ];

//     const bs: IClientBalance[] = [
//       { _id: '5da8516379e6415255e4e856', accountId: 'a', accountName: 'a', amount: 1 },
//       { _id: '5da8516379e6415255e4e857', accountId: 'b', accountName: 'b', amount: -5 },
//       { _id: '5da8516379e6415255e4e858', accountId: 'c', accountName: 'c', amount: 5 },
//       { _id: '5da8516379e6415255e4e859', accountId: 'd', accountName: 'd', amount: 0 },
//     ];

//     const a = cbo.getUpdatesForAddGroupDiscount(orders, bs, 2);

//     expect(a.length).to.equal(2);
//     expect(a[0].query._id).to.equal('5da8516379e6415255e4e858');
//     expect(a[1].query._id).to.equal('5da8516379e6415255e4e859');
//     expect(a[0].data.amount).to.equal(7);
//     expect(a[1].data.amount).to.equal(2);
//   });
// });  

// describe('ClientBalance.getUpdatesForAddGroupDiscount with single order', () => {
//   it('should return orders to be updated', () => {
//     const db = new DB();
//     const cbo = new ClientBalance(db);

//     const orders: IOrder[] = [
//       { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:1, paymentMethod:PaymentMethod.CASH },
//     ];

//     const bs: IClientBalance[] = [
//       { _id: '5da8516379e6415255e4e859', accountId: 'a', accountName: 'a', amount: 1 },
//     ];

//     const a = cbo.getUpdatesForAddGroupDiscount(orders, bs, 2);

//     expect(a.length).to.equal(0);
//   });
// });  


// describe('ClientBalance.getUpdatesForRemoveGroupDiscount with missing field', () => {
//   it('should return orders to be updated', () => {
//     const db = new DB();
//     const cbo = new ClientBalance(db);

//     const orders = [
//       { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
//       { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
//       { mode: 'test', clientId: 'c', clientName: 'c', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:7.5 },
//       { mode: 'test', clientId: 'd', clientName: 'd', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:7.5 }
//     ];

//     const bs: any[] = [
//       { _id: 'a', accountId: 'a', amount: 1 },
//       { _id: 'b', accountId: 'b', amount: -5 },
//       { _id: 'c', accountId: 'c', amount: 5 },
//       { _id: 'd', accountId: 'd', amount: 0 },
//     ];

//     const a = cbo.getUpdatesForRemoveGroupDiscount(orders, bs, 2);

//     expect(a.length).to.equal(0);
//   });
// });

// describe('ClientBalance.getUpdatesForRemoveGroupDiscount with missing field', () => {
//   it('should return orders to be updated', () => {
//     const db = new DB();
//     const cbo = new ClientBalance(db);

//     const orders = [
//       { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
//       { mode: 'test', clientId: 'b', clientName: 'b', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
//       { mode: 'test', clientId: 'c', clientName: 'c', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:7.5 },
//       { mode: 'test', clientId: 'd', clientName: 'd', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:7.5 }
//     ];

//     const bs: any[] = [
//       { _id: 'a', accountId: 'a', amount: 1 },
//       { _id: 'b', accountId: 'b', amount: -5 },
//       { _id: 'c', accountId: 'c', amount: 5 },
//       { _id: 'd', accountId: 'd', amount: 0 },
//     ];

//     const a = cbo.getUpdatesForRemoveGroupDiscount(orders, bs, 2);

//     expect(a.length).to.equal(1);
//   });
// });

// describe('ClientBalance.getUpdatesForRemoveGroupDiscount with missing field', () => {
//   it('should return orders to be updated', () => {
//     const db = new DB();
//     const cbo = new ClientBalance(db);
//     const orders = [
//       { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
//       { mode: 'test', clientId: 'b', clientName: 'b', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
//     ];

//     const bs: any[] = [
//       { _id: 'a', accountId: 'a', amount: 1 },
//       { _id: 'b', accountId: 'b', amount: -5 },
//       { _id: 'c', accountId: 'c', amount: 5 },
//       { _id: 'd', accountId: 'd', amount: 0 },
//     ];

//     const a = cbo.getUpdatesForRemoveGroupDiscount(orders, bs, 2);
//     expect(a.length).to.equal(1);
//   });
// });


// describe('ClientBalance.getUpdatesForRemoveGroupDiscount with single order', () => {
//   it('should return orders to be updated', () => {
//     const db = new DB();
//     const cbo = new ClientBalance(db);

//     const orders = [
//       { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:1 },
//     ];

//     const bs: any[] = [
//       { _id: 'a', accountId: 'a', amount: 1 },
//     ];

//     const a = cbo.getUpdatesForRemoveGroupDiscount(orders, bs, 2);

//     expect(a.length).to.equal(1);
//   });
// });

// describe('ClientBalance.getUpdatesForRemoveGroupDiscount with single order 0 discount', () => {
//   it('should return orders to be updated', () => {
//     const db = new DB();
//     const cbo = new ClientBalance(db);

//     const orders = [
//       { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:1 },
//     ];

//     const bs: any[] = [
//       { _id: 'a', accountId: 'a', amount: 1 },
//     ];

//     const a = cbo.getUpdatesForRemoveGroupDiscount(orders, bs, 2);

//     expect(a.length).to.equal(0);
//   });
// });

// describe('addGroupDiscounts --- orders from 2 different accounts', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let clientConnection: any = null;
//   let oo: Order;
//   let ao: Account;
//   let cbo: ClientBalance;
//   let acs: any[]; // for del
//   let ors: any[]; // for del
//   let bas: any[]; // for del
//   let orders: any[];
//   const accounts: any[] = [
//     { username: 'li1', mode: 'test' },
//     { username: 'li2', mode: 'test' },
//     { username: 'li3', mode: 'test' }
//   ];

//   before(function(done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       clientConnection = dbClient;
//       oo = new Order(db);
//       ao = new Account(db);
//       cbo = new ClientBalance(db);

//       ao.insertMany(accounts).then((rs: any[]) => {
//         acs = rs;

//         orders = [
//           { mode: 'test', clientId: rs[0]._id.toString(), clientName: rs[0].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
//           groupDiscount: 0, total:8.5 },
//           { mode: 'test', clientId: rs[1]._id.toString(), clientName: rs[1].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
//           groupDiscount: 2, total:9.5 },
//         ];
  
//         const balances = [
//           { mode: 'test', accountId: rs[0]._id.toString(), accountName: rs[0].username, amount:-2},
//           { mode: 'test', accountId: rs[1]._id.toString(), accountName: rs[1].username, amount:0},
//           { mode: 'test', accountId: rs[2]._id.toString(), accountName: rs[2].username, amount:2},
//         ];

//         oo.insertMany(orders).then((os: any[]) => {
//           ors = os;
//           cbo.insertMany(balances).then((bs: any[]) => {
//             bas = bs;
//             done();
//           });
//         });
//       });
//     });
//   });

//   after(function(done) {
//     const accountIds: any[] = [];
//     const orderIds: any[] = [];
//     const balanceIds: any[] = [];

//     acs.map(r => { 
//       accountIds.push({ _id: r._id });
//     });

//     ors.map(r => { 
//       orderIds.push({ _id: r._id });
//     });

//     bas.map(r => { 
//       balanceIds.push({ _id: r._id });
//     });


//     ao.bulkDelete(accountIds).then((y: any) => {
//       oo.bulkDelete(orderIds).then((y2: any) => {
//         cbo.bulkDelete(balanceIds).then((y3: any) => {
//           clientConnection.close();
//           done();
//         });
//       });
//     });
//   });

//   it('should the 1st order has group discount 2', (done) => {
//     cbo.addGroupDiscounts(ors).then((updates: any[]) => {
//       const cIds: string[] = [];
//       orders.map((o: any) => { cIds.push(o.clientId); });

//       cbo.find({accountId: {$in: cIds}}).then((cbs: any[]) => {
//         const cb0 = cbs.find((x:any) => x.accountId.toString() === orders[0].clientId.toString());
//         const cb1 = cbs.find((x:any) => x.accountId.toString() === orders[1].clientId.toString());
//         expect(cb0.amount).to.equal(0); // got groupDiscount from front end already
//         expect(cb1.amount).to.equal(0);
//         done();
//       });
//     });
//   });
// });

// describe('addGroupDiscounts with one order', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let clientConnection: any = null;
//   let oo: Order;
//   let ao: Account;
//   let cbo: ClientBalance;
//   let acs: any[];
//   let ors: any[];
//   let bas: any[];
//   let orders: any[];
//   const accounts: any[] = [
//     { username: 'li1', mode: 'test' },
//     { username: 'li2', mode: 'test' },
//     { username: 'li3', mode: 'test' }
//   ];

//   before(function(done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       oo = new Order(db);
//       ao = new Account(db);
//       cbo = new ClientBalance(db);
//       clientConnection = dbClient;

//       ao.insertMany(accounts).then((rs: any[]) => {
//         acs = rs;
//         orders = [
//           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', 
//           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5, paymentMethod: PaymentMethod.CASH },
//         ];
  
//         oo.insertMany(orders).then((os: any[]) => {
//           ors = os;
//           const balances = [
//             { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
//             { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
//             { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
//           ];
//           cbo.insertMany(balances).then((bs: any[]) => {
//             bas = bs;
//             done();
//           });
//         });
//       });
//     });
//   });

//   after(function(done) {
//     const accountIds: any[] = [];
//     const orderIds: any[] = [];
//     const balanceIds: any[] = [];

//     acs.map(r => { 
//       accountIds.push({ _id: r._id });
//     });

//     ors.map(r => { 
//       orderIds.push({ _id: r._id });
//     });

//     bas.map(r => { 
//       balanceIds.push({ _id: r._id });
//     });


//     ao.bulkDelete(accountIds).then((y: any) => {
//       oo.bulkDelete(orderIds).then((y2: any) => {
//         cbo.bulkDelete(balanceIds).then((y3: any) => {
//           clientConnection.close();
//           done();
//         });
//       });
//     });
//   });

//   it('should update orders with group discount', (done) => {
//     cbo.addGroupDiscounts(ors).then((orderUpdates: any[]) => {
//       const cIds: string[] = [];
//       ors.map((o: any) => { cIds.push(o.clientId);});

//       oo.find({clientId: acs[1].id.toString()}).then( (o1s: any[]) => {
//         expect(o1s.length).to.equal(1);
//         expect(o1s[0].groupDiscount).to.equal(2);
//         expect(o1s[0].total).to.equal(9.5);

//         cbo.find({accountId: {$in: cIds}}).then((cbs: any[]) => {
//           const cb0 = cbs.find((x:any) => x.accountId.toString() === orders[0].clientId.toString());
//           expect(cb0.amount).to.equal(0); // got groupDiscount from front end already
//           done();
//         });
//       });
//     });
//   });
// });

// describe('ClientBalance.removeGroupDiscounts with 2 different account orders', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let clientConnection: any = null;
//   let oo: Order;
//   let ao: Account;
//   let cbo: ClientBalance;
//   let acs: any[];
//   let ors: any[];
//   let bas: any[];
//   let orders: any[];
//   const accounts: any[] = [
//     { username: 'li1', mode: 'test' },
//     { username: 'li2', mode: 'test' },
//     { username: 'li3', mode: 'test' }
//   ];

//   before(function(done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       clientConnection = dbClient;
//       oo = new Order(db);
//       ao = new Account(db);
//       cbo = new ClientBalance(db);

//       ao.insertMany(accounts).then((rs: any[]) => {
//         acs = rs;

//         orders = [
//           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
//           groupDiscount: 0, total:8.5 },
//           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
//           groupDiscount: 2, total:9.5 },
//         ];
  
//         // const order = {clientId:c, delivered:x, address:y, groupDiscount: z};
//         oo.insertMany(orders).then((os: any[]) => {
//           ors = os;

//           const balances = [
//             { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
//             { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
//             { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
//           ];

//           cbo.insertMany(balances).then((bs: any[]) => {
//             bas = bs;
//             done();
//           });
//         });
//       });
//     });
//   });

//   after(function(done) {
//     const accountIds: any[] = [];
//     const orderIds: any[] = [];
//     const balanceIds: any[] = [];

//     acs.map(r => { 
//       accountIds.push({ _id: r._id });
//     });

//     ors.map(r => { 
//       orderIds.push({ _id: r._id });
//     });

//     bas.map(r => { 
//       balanceIds.push({ _id: r._id });
//     });


//     ao.bulkDelete(accountIds).then((y: any) => {
//       oo.bulkDelete(orderIds).then((y2: any) => {
//         cbo.bulkDelete(balanceIds).then((y3: any) => {
//           clientConnection.close();
//           done();
//         });
//       });
//     });
//   });

//   it('should the 1st order has group discount 2', (done) => {
//     cbo.removeGroupDiscounts(ors).then((updates: any[]) => {
//       const cIds: string[] = [];
//       orders.map((o: any) => { cIds.push(o.clientId); });

//       cbo.find({accountId: {$in: cIds}}).then((cbs: any[]) => {
//         const cb0 = cbs.find((x:any) => x.accountId.toString() === orders[0].clientId.toString());
//         const cb1 = cbs.find((x:any) => x.accountId.toString() === orders[1].clientId.toString());
//         expect(cb0.amount).to.equal(0); // got groupDiscount from front end already
//         expect(cb1.amount).to.equal(0);
//         done();
//       });
//     });
//   });
// });


// describe('ClientBalance.removeGroupDiscounts with one order', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let clientConnection: any = null;
//   let oo: Order;
//   let ao: Account;
//   let cbo: ClientBalance;
//   let acs: any[];
//   let ors: any[];
//   let bas: any[];
//   let orders: any[];
//   const accounts: any[] = [
//     { username: 'li1', mode: 'test' },
//     { username: 'li2', mode: 'test' },
//     { username: 'li3', mode: 'test' }
//   ];

//   before(function(done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       oo = new Order(db);
//       ao = new Account(db);
//       cbo = new ClientBalance(db);
//       clientConnection = dbClient;

//       ao.insertMany(accounts).then((rs: any[]) => {
//         acs = rs;
//         for(let i=0; i< accounts.length; i++){
//           expect(rs[i].username).to.equal(accounts[i].username);
//         }

//         orders = [
//           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', 
//           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
//         ];
  
//         oo.insertMany(orders).then((os: any[]) => {
//           ors = os;
//           const balances = [
//             { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
//             { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
//             { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
//           ];
//           cbo.insertMany(balances).then((bs: any[]) => {
//             bas = bs;
//             done();
//           });
//         });
//       });
//     });
//   });

//   after(function(done) {
//     const accountIds: any[] = [];
//     const orderIds: any[] = [];
//     const balanceIds: any[] = [];

//     acs.map(r => { 
//       accountIds.push({ _id: r._id });
//     });

//     ors.map(r => { 
//       orderIds.push({ _id: r._id });
//     });

//     bas.map(r => { 
//       balanceIds.push({ _id: r._id });
//     });


//     ao.bulkDelete(accountIds).then((y: any) => {
//       oo.bulkDelete(orderIds).then((y2: any) => {
//         cbo.bulkDelete(balanceIds).then((y3: any) => {
//           clientConnection.close();
//           done();
//         });
//       });
//     });
//   });

//   it('should update orders with group discount', (done) => {
//     cbo.removeGroupDiscounts(ors).then((orderUpdates: any[]) => {
//       const cIds: string[] = [];
//       ors.map((o: any) => {
//         cIds.push(o.clientId);
//       });
//       oo.find({clientId: acs[1]._id.toString()}).then( (o1s: any[]) => {
//         expect(o1s.length).to.equal(1);
//         expect(o1s[0].groupDiscount).to.equal(2); //unchange order
//         expect(o1s[0].total).to.equal(9.5);

//         cbo.find({accountId: acs[1].id.toString()}).then((cbs:any[]) => {
//           expect(cbs[0].amount).to.equal(-2);
//           done();
//         });
//       });
//     });
//   });
// });