import { expect } from 'chai';

import { DB } from "../../db";
import { Config } from "../../config";
import { Account, IAccount, VerificationError } from "../../models/account";

// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

describe('doVerfiyV2', () => {
  const db: any = new DB();
  const cfg: any = new Config();
  let accountModel: Account;
  let connection: any = null;
  let account: IAccount;

  before(function (done) {
    db.init(cfg.DATABASE).then((dbClient: any) => {
      connection = dbClient;
      accountModel = new Account(db);
      done();
    });
  });

  after(function (done) {
    connection.close();
    done();
  });

  it('should verify fail', (done) => {
    const loggedInAccountId = '5e00d408d90bbb02130cc43c';
    accountModel.doVerifyV2('416906546X', '1111', loggedInAccountId).then((x: any) => {
      expect(x.verified).to.equal(false);
      expect(x.err).to.equal(VerificationError.NO_PHONE_NUMBER_BIND);
      done();
    });
  });

  it('should verify fail', (done) => {
    const loggedInAccountId = '5d953ff91a3174727b9a7c70';
    accountModel.doVerifyV2('4169065468', '1111', loggedInAccountId).then((x: any) => {
      expect(x.verified).to.equal(false);
      expect(x.err).to.equal(VerificationError.PHONE_NUMBER_OCCUPIED);
      done();
    });
  });

  it('should verify fail', (done) => {
    const loggedInAccountId = '5d953ff91a3174727b9a7c70';
    accountModel.doVerifyV2('123456', '1111', loggedInAccountId).then((x: any) => {
      expect(x.verified).to.equal(false);
      expect(x.err).to.equal(VerificationError.WRONG_CODE);
      done();
    });
  });

  it('should verify success', (done) => {
    const loggedInAccountId = '5d953ff91a3174727b9a7c70';
    accountModel.doVerifyV2('123456', '1234', loggedInAccountId).then((x: any) => {
      expect(x.verified).to.equal(true);
      expect(x.err).to.equal(VerificationError.NONE);
      done();
    });
  });
}); // end of getAccountByToken


// describe('account doSignup a new account and getAccountByToken', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let accountModel: Account;
//   let connection: any = null;
//   let account: IAccount;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       accountModel = new Account(db);
//       accountModel.doSignup('1234567899', '1234').then((x: IAccount) => {
//         account = x;
//         done();
//       });
//     });
//   });

//   after(function (done) {
//     const id = account._id.toString();
//     accountModel.deleteById(id).then( () => {
//       connection.close();
//       done();
//     });
//   });

//   it('should return the new Account', (done) => {
//     const clientId = account._id.toString();
//     const tokenId = jwt.sign({id:clientId}, cfg.JWT.SECRET, {expiresIn: cfg.JWT.EXPIRY}); // SHA256
//     accountModel.getAccountByToken(tokenId).then((x: IAccount) => {
//       expect(x._id.toString()).to.equal(clientId);
//       expect(x.username).to.equal(account.username);
//       done();
//     });
//   });
// }); // end of getAccountByToken


// describe('account doSignup an existing account', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let accountModel: Account;
//   let connection: any = null;
//   let account: IAccount;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       accountModel = new Account(db);
//       accountModel.doSignup('1234567890', '1234').then((x: IAccount) => {
//         account = x;
//         done();
//       });
//     });
//   });

//   after(function (done) {
//     const id = account._id.toString();
//     accountModel.deleteById(id).then( () => {
//       connection.close();
//       done();
//     });
//   });

//   it('should return the new Account', (done) => {
//     accountModel.doSignup('1234567890', '4321').then((x: IAccount) => {
//       expect(x.username).to.equal('1234567890');
//       expect(x.phone).to.equal('1234567890');
//       expect(x.type).to.equal('client');
//       expect(x.verificationCode).to.equal('4321');
//       done();
//     });
//   });
// }); // end of doSignup


// describe('account doSignup empty phone number', () => {
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
//     // accountModel.deleteById(account._id.toString()).then(() => {
//       connection.close();
//       done();
//     // })
//   });

//   it('should not add any account', (done) => {
//     accountModel.doSignup('', '1234').then((acc: IAccount) => {
//       expect(acc).to.equal(undefined);
//       done();
//     });
//   });
// }); // end of doSignup

// describe('account trySignup with / without account for an existing phone number', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let accountModel: Account;
//   let connection: any = null;
//   let account: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       accountModel = new Account(db);
//       accountModel.doSignup('1234567890', '1234').then((x: any) => {
//         account = x;
//         done();
//       });
//     });
//   });

//   after(function (done) {
//     accountModel.deleteById(account._id.toString()).then( () => {
//       connection.close();
//       done();
//     });
//   });

//   it('should use corresponding account', (done) => {
//     accountModel.trySignup('', '1234567890').then((acc: any) => {
//       expect(acc.phone).to.equal('1234567890');
//       done();
//     });
//   });

//   it('should use corresponding account', (done) => {
//     accountModel.trySignup(account._id.toString(), '1234567890').then((acc: any) => {
//       expect(acc.phone).to.equal('1234567890');
//       done();
//     });
//   });
// }); // end of trySignup

// describe('account trySignup with account for a new phone number', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let accountModel: Account;
//   let connection: any = null;
//   let account: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       accountModel = new Account(db);
//       accountModel.doSignup('1234567890', '1234').then((x: any) => {
//         account = x;
//         done();
//       });
//     });
//   });

//   after(function (done) {
//     accountModel.deleteById(account._id.toString()).then( () => {
//       connection.close();
//       done();
//     });
//   });

//   it('should update corresponding phone', (done) => {
//     accountModel.trySignup(account._id.toString(), '123456789').then((r: any) => {
//       expect(r.phone).to.equal('123456789');
//       expect(r.accountId).to.equal(account._id.toString());
//       done();
//     });
//   });
// }); // end of trySignup

// describe('account trySignup without account for a new phone number', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let accountModel: Account;
//   let connection: any = null;
//   let account: any = null;
//   let newAccountId: any = null;

//   before(function (done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       connection = dbClient;
//       accountModel = new Account(db);
//       accountModel.doSignup('1234567890', '1234').then((x: any) => {
//         account = x;
//         done();
//       });
//     });
//   });

//   after(function (done) {
//     accountModel.deleteById(account._id.toString()).then( () => {
//       accountModel.deleteById(newAccountId).then( () => {
//         connection.close();
//         done();
//       });
//     });
//   });

//   it('should update corresponding phone', (done) => {
//     accountModel.trySignup('', '123456789').then((r: any) => {
//       newAccountId = r.accountId;
//       expect(r.phone).to.equal('123456789');
//       expect(r.accountId).to.not.equal(account._id.toString());
//       done();
//     });
//   });
// }); // end of trySignup