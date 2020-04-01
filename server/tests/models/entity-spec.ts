// import { Transaction, ITransaction, IDbTransaction } from "../../models/transaction";
// import { DB } from "../../db";
// import { expect } from 'chai';
// import moment from "moment";
// import { Config } from "../../config";
// import { Account, IAccount } from "../../models/account";
// import { ObjectId } from "mongodb";
// import { DbStatus, DbResult } from "../../entity";

// const CASH_ID = '5c9511bb0851a5096e044d10';
// const CASH_NAME = 'Cash';
// const BANK_ID = '5c95019e0851a5096e044d0c';
// const BANK_NAME = 'TD Bank';

// describe('entity bulkUpdate', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let transactionModel: Transaction;
//   let accountModel: Account;
//   let connection: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       transactionModel = new Transaction(db);
//       accountModel = new Account(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return delivered date time string', (done) => {
//     const client2Id = '5d953ff91a3174727b9a7c70';
//     const client1Id = '5e00d3c6d90bbb02130cc43b';
//     const merchantAccountId = '5e00d408d90bbb02130cc43c';

//     const oId = new ObjectId().toString();
//     const d = { fromId: CASH_ID, toId: merchantAccountId, amount: 6 };
//     // { fromId: client1Id, toId: CASH_ID, amount: 10 }

//     const accountQuery = { _id: { $in: [d.fromId, d.toId] } };

//     accountModel.find(accountQuery).then((accounts: IAccount[]) => {
//       const fromAccount: any = accounts.find(x => x._id.toString() === d.fromId);
//       const toAccount: any = accounts.find(x => x._id.toString() === d.toId);
//       const fromBalance = Math.round((fromAccount.balance + d.amount) * 100) / 100;
//       const toBalance = Math.round((toAccount.balance - d.amount) * 100) / 100;

//       const updates = [
//         { query: { _id: d.fromId }, data: { balance: fromBalance } },
//         { query: { _id: d.toId }, data: { balance: toBalance } }
//       ];

//       accountModel.bulkUpdate(updates).then((r: DbResult) => {
//         expect(r.status).to.equal(DbStatus.SUCCESS);

//         accountModel.findOne({ _id: d.fromId }).then((m: IAccount) => {
//           accountModel.findOne({ _id: d.toId }).then((c: IAccount) => {
//             expect(m.balance).to.equal(fromBalance);
//             expect(c.balance).to.equal(toBalance);
//             done();
//           });
//         });

//       });
//     });

//   });
// });


// describe('entity update object {}', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let accountModel: Account;
//   let connection: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       accountModel = new Account(db);
//       done();
//     });
//   });

//   after(function (done) {
//     connection.close();
//     done();
//   });

//   it('should return undefined', (done) => {
//     const client2Id = '5d953ff91a3174727b9a7c70';
//     const q = { _id:  client2Id};

//     accountModel.updateOne(q, {}).then((r: any) => {
//       expect(r).to.equal(undefined);
//       done();
//     });
//   });
// });

// describe("entity update object {phone: ''}", () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let accountModel: Account;
//   let connection: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       accountModel = new Account(db);
//       done();
//     });
//   });

//   after(function (done) {
//     const client2Id = '5d953ff91a3174727b9a7c70';
//     const q = { _id:  client2Id};
//     accountModel.updateOne(q, {phone: '123456'}).then((r: any) => {
//       connection.close();
//       done();
//     });
//   });

//   it('should return empty string', (done) => {
//     const client2Id = '5d953ff91a3174727b9a7c70';

//     const q = { _id:  client2Id};

//     accountModel.updateOne(q, {phone: ''}).then((r: any) => {
//       accountModel.findOne(q).then((account: any) => {
//         expect(account.phone).to.equal('');
//         done();
//       });
//     });
//   });
// });
