// import { Transaction, ITransaction, IDbTransaction, TransactionAction } from "../../models/transaction";
// import { DB } from "../../db";
// // import { expect } from 'chai';
// // import moment from "moment";
// import { Config } from "../../config";
// import { Account, IAccount } from "../../models/account";
// // import { ObjectId } from "mongodb";


// describe('transaction CRUD operation', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let accountModel: Account;
//   let transactionModel: Transaction;
//   let connection: any = null;


//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       transactionModel = new Transaction(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return delivered date time string', (done) => {
//     const clientId = '5d953ff91a3174727b9a7c70'; // test account
//     const merchantId = '5e00d408d90bbb02130cc43c'; // test merchant

//     accountModel.findOne({ _id: clientId }).then((c: IAccount) => {
//       accountModel.findOne({ _id: merchantId }).then((m: IAccount) => {
//         const t: ITransaction = {
//           fromId: c._id.toString(),
//           fromName: c.username,
//           toId: m._id.toString(),
//           toName: m.username,
//           actionCode: TransactionAction.TEST.code,
//           amount: 10,
//           fromBalance: c.balance,
//           toBalance: m.balance
//         };

//         // transactionModel.insertOne(t).then((r: IDbTransaction) => {
//         //   if (r) {
//         //     transactionModel.findOne({ _id: r._id.toString() }).then((t1: IDbTransaction) => {
//         //       accountModel.findOne({ _id: client1Id }).then((c1: IAccount) => {
//         //         accountModel.findOne({ _id: client2Id }).then((c2: IAccount) => {

//         //           expect(t1.amount).to.equal(10);
//         //           expect(c1.balance).to.equal(t1.fromBalance);
//         //           expect(c2.balance).to.equal(t1.toBalance);
//         //           expect(c1.balance).to.equal(r.fromBalance);
//         //           expect(c2.balance).to.equal(r.toBalance);

//         //           done();

//         //         });
//         //       });
//         //     });
//         //   } else {
//         //     done();
//         //   }

//         // });
//       });
//     });
//   });
// });




// // describe('getDeliveryDateTimeByPhase', () => {
// //   it('should return delivered date time', () => {
// //     const db = new DB();
// //     const transactionModel = new Transaction(db);
// //     const phases: IPhase[] = [
// //       {
// //         transactionEnd: '10:45',
// //         pickup: '11:20'
// //       },
// //       {
// //         transactionEnd: '11:30',
// //         pickup: '12:00'
// //       },
// //     ];

// //     // utc time
// //     const datas = [
// //       { created: '2019-11-03T14:52:59.566Z', phases: phases, type: 'today', ret: '2019-11-03T16:20:00.000Z' },
// //       { created: '2019-11-03T15:52:59.566Z', phases: phases, type: 'today', ret: '2019-11-03T17:00:00.000Z' },
// //       { created: '2019-11-03T16:52:59.566Z', phases: phases, type: 'today', ret: '2019-11-03T16:20:00.000Z' },
// //     ];

// //     datas.map(d => {
// //       const r: string = transactionModel.getDeliveryDateTimeByPhase(d.created, d.phases, d.type);
// //       expect(r).to.equal(d.ret);
// //     });

// //   });
// // });

// // describe('transaction doInsertOne, find success', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let transactionModel: Transaction;
// //   let accountModel: Account;
// //   let connection: any = null;

// //   before(function (done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       connection = dbClient;
// //       transactionModel = new Transaction(db);
// //       accountModel = new Account(db);
// //       done();
// //     });
// //   });

// //   after(function (done) {
// //     connection.close();
// //     done();
// //   });

// //   it('should return delivered date time string', (done) => {
// //     const client2Id = '5d953ff91a3174727b9a7c70';
// //     const client1Id = '5e00d3c6d90bbb02130cc43b';
// //     const merchantId = '5e00d408d90bbb02130cc43c';

// //     accountModel.findOne({ _id: client1Id }).then((client1: IAccount) => {
// //       accountModel.findOne({ _id: client2Id }).then((client2: IAccount) => {
// //         const t: ITransaction = {
// //           fromId: client1._id.toString() + 'x',
// //           fromName: client1.username,
// //           toId: client2._id.toString(),
// //           toName: client2.username,
// //           action: 'transfer',
// //           amount: 10,
// //           fromBalance: client1.balance,
// //           toBalance: client2.balance
// //         };

// //         transactionModel.doInsertOne(t).then((r: IDbTransaction) => {
// //           expect(r).to.equal(undefined);
// //           done();
// //         });
// //       });
// //     });
// //   });
// // });

// // describe('transaction doInsertOne, find fail', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let transactionModel: Transaction;
// //   let accountModel: Account;
// //   let connection: any = null;

// //   before(function (done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       connection = dbClient;
// //       transactionModel = new Transaction(db);
// //       accountModel = new Account(db);
// //       done();
// //     });
// //   });

// //   after(function (done) {
// //     connection.close();
// //     done();
// //   });

// //   it('should return delivered date time string', (done) => {
// //     const client2Id = '5d953ff91a3174727b9a7c70';
// //     const client1Id = '5e00d3c6d90bbb02130cc43b';
// //     const merchantId = '5e00d408d90bbb02130cc43c';

// //     accountModel.findOne({ _id: client1Id }).then((client1: IAccount) => {
// //       accountModel.findOne({ _id: client2Id }).then((client2: IAccount) => {
// //         const t: ITransaction = {
// //           fromId: client1._id.toString(),
// //           fromName: client1.username,
// //           toId: client2._id.toString(),
// //           toName: client2.username,
// //           action: 'transfer',
// //           amount: 10,
// //           fromBalance: client1.balance,
// //           toBalance: client2.balance
// //         };

// //         transactionModel.doInsertOne(t).then((r: IDbTransaction) => {

// //           if (r) {
// //             transactionModel.findOne({ _id: r._id.toString() }).then((t1: IDbTransaction) => {
// //               accountModel.findOne({ _id: client1Id }).then((c1: IAccount) => {
// //                 accountModel.findOne({ _id: client2Id }).then((c2: IAccount) => {

// //                   expect(t1.amount).to.equal(10);
// //                   expect(c1.balance).to.equal(t1.fromBalance);
// //                   expect(c2.balance).to.equal(t1.toBalance);
// //                   expect(c1.balance).to.equal(r.fromBalance);
// //                   expect(c2.balance).to.equal(r.toBalance);

// //                   done();

// //                 });
// //               });
// //             });
// //           } else {
// //             done();
// //           }

// //         });
// //       });
// //     });
// //   });
// // });


// // describe('saveTransactionsForPlaceOrder and saveTransactionsForRemoveOrder', () => {
// //   const db: any = new DB();
// //   const cfg: any = new Config();
// //   let transactionModel: Transaction;
// //   let accountModel: Account;
// //   let connection: any = null;

// //   before(function (done) {
// //     db.init(cfg.DATABASE).then((dbClient: any) => {
// //       connection = dbClient;
// //       transactionModel = new Transaction(db);
// //       accountModel = new Account(db);
// //       done();
// //     });
// //   });

// //   after(function (done) {
// //     connection.close();
// //     done();
// //   });

// //   it('should return delivered date time string', (done) => {
// //     const client2Id = '5d953ff91a3174727b9a7c70';
// //     const client1Id = '5e00d3c6d90bbb02130cc43b';
// //     const merchantAccountId = '5e00d408d90bbb02130cc43c';

// //     const oId = new ObjectId().toString();

// //     const ds = [{
// //       orderId: oId,
// //       merchantAccountId: merchantAccountId,
// //       merchantName: 'test merchant',
// //       clientId: client1Id,
// //       clientName: 'test client1',
// //       cost: 6,
// //       total: 10,
// //       delivered: '2019-05-01T11:00:00.000Z'
// //     }];

// //     ds.map(d => {
// //       transactionModel.saveTransactionsForPlaceOrder(d.orderId, d.merchantAccountId, d.merchantName, d.clientId, d.clientName,
// //         d.cost, d.total, d.delivered).then(() => {
// //           const q1 = { orderId: oId, fromId: merchantAccountId, action: 'duocun order from merchant' };
// //           const q2 = { orderId: oId, toId: client1Id, action: 'client order from duocun' };
// //           const q3 = { orderId: oId, toId: merchantAccountId, action: 'duocun cancel order from merchant' };
// //           const q4 = { orderId: oId, fromId: client1Id, action: 'client cancel order from duocun' };
// //           transactionModel.findOne(q1).then((t1: IDbTransaction) => {
// //             transactionModel.findOne(q2).then((t2: IDbTransaction) => {

// //               accountModel.findOne({ _id: merchantAccountId }).then((m: IAccount) => {
// //                 accountModel.findOne({ _id: client1Id }).then((c: IAccount) => {

// //                   expect(t1.amount).to.equal(6);
// //                   expect(t2.amount).to.equal(10);
// //                   expect(m.balance).to.equal(t1.fromBalance);
// //                   expect(c.balance).to.equal(t2.toBalance);

// //                   transactionModel.saveTransactionsForRemoveOrder(d.orderId, d.merchantAccountId, d.merchantName, d.clientId,
// //                     d.clientName, d.cost, d.total, d.delivered).then(() => {

// //                       transactionModel.findOne(q3).then((t3: IDbTransaction) => {
// //                         transactionModel.findOne(q4).then((t4: IDbTransaction) => {

// //                           accountModel.findOne({ _id: merchantAccountId }).then((m1: IAccount) => {
// //                             accountModel.findOne({ _id: client1Id }).then((c1: IAccount) => {

// //                               if (t3 && t4) {
// //                                 expect(t3.amount).to.equal(6);
// //                                 expect(t4.amount).to.equal(10);
// //                                 expect(m1.balance).to.equal(t3.toBalance);
// //                                 expect(c1.balance).to.equal(t4.fromBalance);
// //                               }

// //                               done();
// //                             });
// //                           });
// //                         });
// //                       });
// //                     });
// //                 });
// //               });
// //             });
// //           });
// //         });
// //     });
// //   });
// // });

