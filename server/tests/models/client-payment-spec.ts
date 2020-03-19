// import { Order } from '../../models/order';
// import { Account } from '../../models/account';
// import { ClientPayment } from '../../models/client-payment';

// import { DB } from '../../db';
// import { expect } from 'chai';
// import { Config } from '../../config';
// import { ClientBalance } from '../../models/client-balance';

// // describe('addGroupDiscount', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let cpo: ClientPayment;
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
// //       cpo = new ClientPayment(db);
// //       clientConnection = dbClient;

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         for(let i=0; i< accounts.length; i++){
// //           expect(rs[i].username).to.equal(accounts[i].username);
// //         }

// //         orders = [
// //           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', 
// //           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:8.5 },
// //           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc',
// //           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:9.5 },
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
// //       {id: ors[0].id.toString()},
// //       {id: ors[1].id.toString()},
// //     ];
// //     acs.map(r => { accountIds.push({ id: r.id.toString() }) });
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
// //     const date = ors[0].delivered;
// //     const address = ors[0].address;
// //     const clientId = ors[0].clientId;
// //     cpo.addGroupDiscount(clientId, date, address).then((x) => {
// //       const cIds: string[] = [];
// //       orders.map((o: any) => {
// //         cIds.push(o.clientId);
// //       });
// //       oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
// //         const order0 = o1s.find((x:any) => x.clientId === orders[0].clientId);
// //         expect(order0.groupDiscount).to.equal(2);
// //         expect(order0.total).to.equal(8.5);
// //         const order1 = o1s.find((x:any) => x.clientId === orders[1].clientId);
// //         expect(order1.groupDiscount).to.equal(2);
// //         expect(order1.total).to.equal(7.5);
// //         done();
// //       });
// //     });
// //   });
// // });

// describe('doAfterPayOrder with existing order of other client', () => {
//   const db: DB = new DB();
//   const cfg: Config = new Config();
//   let clientConnection: any = null;
//   let oo: Order;
//   let ao: Account;
//   let cbo: ClientBalance;
//   let cpo: ClientPayment;
//   let acs: any[];
//   let ors: any[];
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
//       cpo = new ClientPayment(db);

//       clientConnection = dbClient;

//       ao.insertMany(accounts).then((rs: any[]) => {
//         acs = rs;
//         for(let i=0; i< accounts.length; i++){
//           expect(rs[i].username).to.equal(accounts[i].username);
//         }

//         orders = [
//           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', 
//           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:8.5, paymentMethod: PaymentMethod.CASH }, // new inserted
//           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', 
//           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:9.5, paymentMethod: PaymentMethod.CASH },
//         ];
        
//         oo.insertMany(orders).then((os: any[]) => {
//           ors = os;
//           const balances = [
//             { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
//             { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
//             { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
//           ];
//           cbo.insertMany(balances).then((bs: any[]) => {
//             done();
//           });
//         });
//       });
//     });
//   });

//   after(function(done) {
//     const accountIds: any[] = [];
//     const cIds: any[] = [];
//     const orderIds: any[] = [
//       {_id: ors[0]._id.toString()},
//       {_id: ors[1]._id.toString()}
//     ];
//     acs.map(r => { 
//       accountIds.push({ _id: r._id.toString() });
//       cIds.push({accountId: r._id.toString()});
//     });
//     ao.bulkDelete(accountIds).then((y: any) => {
//       expect(y.deletedCount).to.equal(3);
//       oo.bulkDelete(orderIds).then((y2: any) => {
//         expect(y2.deletedCount).to.equal(2);
//         cbo.bulkDelete(cIds).then((y3: any) => {
//           expect(y3.deletedCount).to.equal(3);
//           clientConnection.close();
//           done();
//         });
//       });
//     });
//   });

//   it('should update orders with group discount', (done) => {
//     const clientId = ors[0].clientId;
//     const delivered = ors[0].delivered;
//     const address = ors[0].address;
//     cpo.doAfterPayOrder(clientId, delivered, address, 8.5).then((x: any) => {
//       const cIds: string[] = [];
//       orders.map((o: any) => {
//         cIds.push(o.clientId);
//       });
//       oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
//         const order0 = o1s.find((x:any) => x.clientId.toString() === orders[0].clientId.toString() );
//         const order1 = o1s.find((x:any) => x.clientId.toString()  === orders[1].clientId.toString() );
//         expect(order0.groupDiscount).to.equal(2); // got groupDiscount from front end
//         expect(order0.total).to.equal(8.5); // got groupDiscount from front end already
//         expect(order1.groupDiscount).to.equal(2); // got groupDiscount from front end
//         expect(order1.total).to.equal(7.5); // got groupDiscount from front end already

//         cbo.find({accountId: {$in: cIds}}).then((cbs: any[]) => {
//           const mbMe = cbs.find((x:any) => x.accountId.toString()  === orders[0].clientId.toString() );
//           const mb = cbs.find((x:any) => x.accountId.toString()  === orders[1].clientId.toString() );
//           expect(mbMe.amount).to.equal(6.5);
//           expect(mb.amount).to.equal(2);
//           done();
//         });
//       });
//     });
//   });
// });


// describe('doAfterPayOrder with no order of other client', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let clientConnection: any = null;
//   let oo: Order;
//   let ao: Account;
//   let cbo: ClientBalance;
//   let cpo: ClientPayment;
//   let acs: any[];
//   let ors: any[];
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
//       cpo = new ClientPayment(db);

//       clientConnection = dbClient;

//       ao.insertMany(accounts).then((rs: any[]) => {
//         acs = rs;
//         for(let i=0; i< accounts.length; i++){
//           expect(rs[i].username).to.equal(accounts[i].username);
//         }

//         orders = [
//           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', 
//           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:8.5, paymentMethod: PaymentMethod.CASH }, // new inserted
//           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', 
//           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:9.5, paymentMethod: PaymentMethod.CASH },
//         ];
        
//         oo.insertMany(orders).then((os: any[]) => {
//           ors = os;
//           const balances = [
//             { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
//             { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
//             { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
//           ];
//           cbo.insertMany(balances).then((bs: any[]) => {
//             done();
//           });
//         });
//       });
//     });
//   });

//   after(function(done) {
//     const accountIds: any[] = [];
//     const cIds: any[] = [];
//     const orderIds: any[] = [
//       {_id: ors[0]._id.toString()},
//       {_id: ors[1]._id.toString()}
//     ];
//     acs.map(r => { 
//       accountIds.push({ _id: r._id.toString() });
//       cIds.push({accountId: r._id.toString()});
//     });
//     ao.bulkDelete(accountIds).then((y: any) => {
//       expect(y.deletedCount).to.equal(3);
//       oo.bulkDelete(orderIds).then((y2: any) => {
//         expect(y2.deletedCount).to.equal(2);
//         cbo.bulkDelete(cIds).then((y3: any) => {
//           expect(y3.deletedCount).to.equal(3);
//           clientConnection.close();
//           done();
//         });
//       });
//     });
//   });

//   it('should update orders with group discount', (done) => {
//     const clientId = ors[0].clientId;
//     const delivered = ors[0].delivered;
//     const address = ors[0].address;
//     cpo.doAfterPayOrder(clientId, delivered, address, 8.5).then((x: any) => {
//       const cIds: string[] = [];
//       orders.map((o: any) => {
//         cIds.push(o.clientId);
//       });
//       oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
//         const order0 = o1s[0]; // .find((x:any) => x.clientId === orders[0].clientId);
//         const order1 = o1s[1]; // .find((x:any) => x.clientId === orders[1].clientId);
//         expect(order0.groupDiscount).to.equal(2); // got groupDiscount from front end
//         expect(order0.total).to.equal(8.5); // got groupDiscount from front end already
//         expect(order1.groupDiscount).to.equal(0); // got groupDiscount from front end
//         expect(order1.total).to.equal(9.5); // got groupDiscount from front end already

//         cbo.find({accountId: {$in: cIds}}).then((cbs: any[]) => {
//           const mbMe = cbs.find((x:any) => x.accountId.toString()  === orders[0].clientId.toString() );
//           expect(mbMe.amount).to.equal(6.5);
//           done();
//         });
//       });
//     });
//   });
// });


// // describe('processAfterRemoveOrder with existing order of other client', () => {
// //   const db: DB = new DB();
// //   const cfg: Config = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let cbo: ClientBalance;
// //   let cpo: ClientPayment;
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
// //       cbo = new ClientBalance(db);
// //       cpo = new ClientPayment(db);

// //       clientConnection = dbClient;

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         for(let i=0; i< accounts.length; i++){
// //           expect(rs[i].username).to.equal(accounts[i].username);
// //         }

// //         orders = [
// //           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', 
// //           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:8.5, paymentMethod: PaymentMethod.CASH }, // new inserted
// //           { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', 
// //           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:9.5, paymentMethod: PaymentMethod.CASH },
// //         ];
        
// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           const balances = [
// //             { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
// //             { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
// //             { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
// //           ];
// //           cbo.insertMany(balances).then((bs: any[]) => {
// //             done();
// //           });
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = [];
// //     const cIds: any[] = [];
// //     const orderIds: any[] = [
// //       {id: ors[0].id.toString()},
// //       {id: ors[1].id.toString()}
// //     ];
// //     acs.map(r => { 
// //       accountIds.push({ id: r.id.toString() });
// //       cIds.push({accountId: r.id.toString()});
// //     });
// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(3);
// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(2);
// //         cbo.bulkDelete(cIds).then((y3: any) => {
// //           expect(y3.deletedCount).to.equal(3);
// //           clientConnection.close();
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   it('should update orders with group discount', (done) => {
// //     const orderId = ors[0].id.toString();
// //     cpo.processAfterRemoveOrder(orderId).then((x: any) => {
// //       const cIds: string[] = [];
// //       orders.map((o: any) => {
// //         cIds.push(o.clientId);
// //       });
// //       oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
// //         const order0 = o1s.find((x:any) => x.clientId === orders[0].clientId);
// //         const order1 = o1s.find((x:any) => x.clientId === orders[1].clientId);
// //         expect(order0.groupDiscount).to.equal(2); // got groupDiscount from front end
// //         expect(order0.total).to.equal(8.5); // got groupDiscount from front end already
// //         expect(order1.groupDiscount).to.equal(2); // got groupDiscount from front end
// //         expect(order1.total).to.equal(7.5); // got groupDiscount from front end already

// //         cbo.find({accountId: {$in: cIds}}).then((cbs: any[]) => {
// //           const mbMe = cbs.find((x:any) => x.accountId === orders[0].clientId);
// //           const mb = cbs.find((x:any) => x.accountId === orders[1].clientId);
// //           expect(mbMe.amount).to.equal(-2);
// //           expect(mb.amount).to.equal(2);
// //           done();
// //         });
// //       });
// //     });
// //   });
// // });



// // describe('processAfterRemoveOrder with no order of other client', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let clientConnection: any = null;
// //   let oo: Order;
// //   let ao: Account;
// //   let cbo: ClientBalance;
// //   let cpo: ClientPayment;
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
// //       cbo = new ClientBalance(db);
// //       cpo = new ClientPayment(db);

// //       clientConnection = dbClient;

// //       ao.insertMany(accounts).then((rs: any[]) => {
// //         acs = rs;
// //         for(let i=0; i< accounts.length; i++){
// //           expect(rs[i].username).to.equal(accounts[i].username);
// //         }

// //         orders = [
// //           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', 
// //           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:8.5, paymentMethod: PaymentMethod.CASH }, // new inserted
// //           { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', 
// //           delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:9.5, paymentMethod: PaymentMethod.CASH },
// //         ];
        
// //         oo.insertMany(orders).then((os: any[]) => {
// //           ors = os;
// //           const balances = [
// //             { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
// //             { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
// //             { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
// //           ];
// //           cbo.insertMany(balances).then((bs: any[]) => {
// //             done();
// //           });
// //         });
// //       });
// //     });
// //   });

// //   after(function(done) {
// //     const accountIds: any[] = [];
// //     const cIds: any[] = [];
// //     const orderIds: any[] = [
// //       {id: ors[0].id.toString()},
// //       {id: ors[1].id.toString()}
// //     ];
// //     acs.map(r => { 
// //       accountIds.push({ id: r.id.toString() });
// //       cIds.push({accountId: r.id.toString()});
// //     });
// //     ao.bulkDelete(accountIds).then((y: any) => {
// //       expect(y.deletedCount).to.equal(3);
// //       oo.bulkDelete(orderIds).then((y2: any) => {
// //         expect(y2.deletedCount).to.equal(2);
// //         cbo.bulkDelete(cIds).then((y3: any) => {
// //           clientConnection.close();
// //           done();
// //         });
// //       });
// //     });
// //   });

// //   it('should update orders with group discount', (done) => {
// //     const orderId = ors[0].id.toString();
// //     cpo.processAfterRemoveOrder(orderId).then( (x: any) => {
// //       const cIds: string[] = [];
// //       orders.map((o: any) => {
// //         cIds.push(o.clientId);
// //       });
// //       oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
// //         const order0 = o1s[0]; // .find((x:any) => x.clientId === orders[0].clientId);
// //         const order1 = o1s[1]; // .find((x:any) => x.clientId === orders[1].clientId);
// //         expect(order0.groupDiscount).to.equal(0); // got groupDiscount from front end
// //         expect(order0.total).to.equal(10.5); // got groupDiscount from front end already
// //         expect(order1.groupDiscount).to.equal(0); // got groupDiscount from front end
// //         expect(order1.total).to.equal(9.5); // got groupDiscount from front end already

// //         cbo.find({accountId: {$in: cIds}}).then((cbs: any[]) => {
// //           const mbMe = cbs.find((x:any) => x.accountId === orders[0].clientId);
// //           expect(mbMe.amount).to.equal(-4);
// //           done();
// //         });
// //       });
// //     });
// //   });
// // });
