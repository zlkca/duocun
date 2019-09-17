import { Order } from '../../models/order';
import { Account } from '../../models/account';
import { ClientBalance } from '../../models/client-balance';

import { DB } from '../../db';
import { expect } from 'chai';
import { Config } from '../../config';

describe('getMyBalanceForAddOrder', () => {
  it('should return correct balance', () => {
    const db = new DB();
    const cbo = new ClientBalance(db);

    const params: any[] = [
      // prepaid
      { balance: 15.56, paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: 6.06 },
      { balance: 5.56,  paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: -3.94 },
      { balance: 0,     paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: -9.5 },
      { balance: -5.56, paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: -15.06 },
      { balance: -15.56,paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: -25.06 },
      // cash
      { balance: 15.56, paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: 6.06 },
      { balance: 5.56,  paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: -3.94 },
      { balance: 0,     paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: -9.5 },
      { balance: -5.56, paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: -15.06 },
      { balance: -15.56,paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: -25.06 },

      { balance: 15.56, paymentMethod: 'cash', bPaid: true, payable: 9.5, paid: 30, expected: 36.06 },
      { balance: 5.56,  paymentMethod: 'cash', bPaid: true, payable: 9.5, paid: 30, expected: 26.06 },
      { balance: 0,     paymentMethod: 'cash', bPaid: true, payable: 9.5, paid: 30, expected: 20.5 },
      { balance: -5.56, paymentMethod: 'cash', bPaid: true, payable: 9.5, paid: 30, expected: 14.94 },
      { balance: -15.56,paymentMethod: 'cash', bPaid: true, payable: 9.5, paid: 30, expected: 4.94 },
      // card
      { balance: 15.56, paymentMethod: 'card', bPaid: false, payable: 9.5, expected: null },
      { balance: 5.56,  paymentMethod: 'card', bPaid: false, payable: 9.5, expected: null },
      { balance: 0,     paymentMethod: 'card', bPaid: false, payable: 9.5, expected: null },
      { balance: -5.56, paymentMethod: 'card', bPaid: false, payable: 9.5, expected: null },
      { balance: -15.56,paymentMethod: 'card', bPaid: false, payable: 9.5, expected: null },

      { balance: 15.56, paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: 36.06 },
      { balance: 5.56,  paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: 26.06 },
      { balance: 0,     paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: 20.5 },
      { balance: -5.56, paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: 14.94 },
      { balance: -15.56,paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: 4.94 },

      // wechat
      { balance: 15.56, paymentMethod: 'WECHATPAY', bPaid: false, payable: 9.5, expected: null },
      { balance: 5.56,  paymentMethod: 'WECHATPAY', bPaid: false, payable: 9.5, expected: null },
      { balance: 0,     paymentMethod: 'WECHATPAY', bPaid: false, payable: 9.5, expected: null },
      { balance: -5.56, paymentMethod: 'WECHATPAY', bPaid: false, payable: 9.5, expected: null },
      { balance: -15.56,paymentMethod: 'WECHATPAY', bPaid: false, payable: 9.5, expected: null },

      { balance: 15.56, paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: 36.06 },
      { balance: 5.56,  paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: 26.06 },
      { balance: 0,     paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: 20.5 },
      { balance: -5.56, paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: 14.94 },
      { balance: -15.56,paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: 4.94 },
    ];

    params.map(p => {
      const b = cbo.getMyBalanceForAddOrder(p.balance, p.paymentMethod, p.bPaid, p.payable, p.paid);
      expect(b).to.equal(p.expected);
    });
  });
});

describe('getMyBalanceForRemoveOrder', () => {
  it('should return correct balance', () => {
    const db = new DB();
    const cbo = new ClientBalance(db);

    const params: any[] = [
      // prepaid
      { balance: 15.56, paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: 25.06 },
      { balance: 5.56,  paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: 15.06 },
      { balance: 0,     paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: 9.5 },
      { balance: -5.56, paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: 3.94 },
      { balance: -15.56,paymentMethod: 'prepaid', bPaid: false, payable: 9.5, expected: -6.06 },
      // cash
      { balance: 15.56, paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: 25.06 },
      { balance: 5.56,  paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: 15.06 },
      { balance: 0,     paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: 9.5 },
      { balance: -5.56, paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: 3.94 },
      { balance: -15.56,paymentMethod: 'cash', bPaid: false, payable: 9.5, expected: -6.06 },
      // card
      { balance: 15.56, paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: 25.06 },
      { balance: 5.56,  paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: 15.06 },
      { balance: 0,     paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: 9.5 },
      { balance: -5.56, paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: 3.94 },
      { balance: -15.56,paymentMethod: 'card', bPaid: true, payable: 9.5, paid: 30, expected: -6.06 },

      // wechat
      { balance: 15.56, paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: 25.06 },
      { balance: 5.56,  paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: 15.06 },
      { balance: 0,     paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: 9.5 },
      { balance: -5.56, paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: 3.94 },
      { balance: -15.56,paymentMethod: 'WECHATPAY', bPaid: true, payable: 9.5, paid: 30, expected: -6.06 },
    ];

    params.map(p => {
      const b = cbo.getMyBalanceForRemoveOrder(p.balance, p.paymentMethod, p.payable);
      expect(b).to.equal(p.expected);
    });
  });
});


describe('getBalancesToAddGroupDiscount with missing field', () => {
  it('should return orders to be updated', () => {
    const db = new DB();
    const cbo = new ClientBalance(db);

    // const orderUpdates: any[] = [
    //   {query: {id: 'a'}, data: { id: 'a', clientId: 'a', groupDiscount: 1, total: 1 }},
    //   {query: {id: 'b'}, data: { id: 'b', clientId: 'b', groupDiscount: 2, total: 1 }},
    //   {query: {id: 'c'}, data: { id: 'c', clientId: 'c', groupDiscount: 0, total: 1 }},
    //   {query: {id: 'd'}, data: { id: 'd', clientId: 'd', groupDiscount: 0, total: 1 }},
    // ];
    const orders = [
      { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 1, total:1 },
      { mode: 'test', clientId: 'b', clientName: 'b', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:1 },
      { mode: 'test', clientId: 'c', clientName: 'c', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:1 },
      { mode: 'test', clientId: 'd', clientName: 'd', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:1 }
    ];
    const bs: any[] = [
      { id: 'a', accountId: 'a', amount: 1 },
      { id: 'b', accountId: 'b', amount: -5 },
      { id: 'c', accountId: 'c', amount: 5 },
      { id: 'd', accountId: 'd', amount: 0 },
    ];

    const a = cbo.getBalancesToAddGroupDiscount(orders, bs, 2);

    expect(a.length).to.equal(2);
    expect(a[0].data.amount).to.equal(7);
    expect(a[1].data.amount).to.equal(2);
    // expect(a[2].data.amount).to.equal(7);
    // expect(a[3].data.amount).to.equal(2);
  });
});  


describe('getBalancesToRemoveGroupDiscount with missing field', () => {
  it('should return orders to be updated', () => {
    const db = new DB();
    const cbo = new ClientBalance(db);

    const orders = [
      { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
      { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
      { mode: 'test', clientId: 'c', clientName: 'c', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:7.5 },
      { mode: 'test', clientId: 'd', clientName: 'd', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:7.5 }
    ];

    const bs: any[] = [
      { id: 'a', accountId: 'a', amount: 1 },
      { id: 'b', accountId: 'b', amount: -5 },
      { id: 'c', accountId: 'c', amount: 5 },
      { id: 'd', accountId: 'd', amount: 0 },
    ];

    const a = cbo.getBalancesToRemoveGroupDiscount(orders, bs, 2);

    expect(a.length).to.equal(0);
  });
});

describe('getBalancesToRemoveGroupDiscount with missing field', () => {
  it('should return orders to be updated', () => {
    const db = new DB();
    const cbo = new ClientBalance(db);

    const orders = [
      { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
      { mode: 'test', clientId: 'b', clientName: 'b', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
      { mode: 'test', clientId: 'c', clientName: 'c', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:7.5 },
      { mode: 'test', clientId: 'd', clientName: 'd', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:7.5 }
    ];

    const bs: any[] = [
      { id: 'a', accountId: 'a', amount: 1 },
      { id: 'b', accountId: 'b', amount: -5 },
      { id: 'c', accountId: 'c', amount: 5 },
      { id: 'd', accountId: 'd', amount: 0 },
    ];

    const a = cbo.getBalancesToRemoveGroupDiscount(orders, bs, 2);

    expect(a.length).to.equal(1);
  });
});

describe('getBalancesToRemoveGroupDiscount with missing field', () => {
  it('should return orders to be updated', () => {
    const db = new DB();
    const cbo = new ClientBalance(db);
    const orders = [
      { mode: 'test', clientId: 'a', clientName: 'a', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 0, total:8.5 },
      { mode: 'test', clientId: 'b', clientName: 'b', address:'abc', delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
    ];

    const bs: any[] = [
      { id: 'a', accountId: 'a', amount: 1 },
      { id: 'b', accountId: 'b', amount: -5 },
      { id: 'c', accountId: 'c', amount: 5 },
      { id: 'd', accountId: 'd', amount: 0 },
    ];

    const a = cbo.getBalancesToRemoveGroupDiscount(orders, bs, 2);
    expect(a.length).to.equal(1);
  });
});

describe('addGroupDiscountForBalances with 2 different account orders', () => {
  const db: any = new DB();
  const cfg: any = new Config();
  let clientConnection: any = null;
  let oo: Order;
  let ao: Account;
  let cbo: ClientBalance;
  let acs: any[];
  let ors: any[];
  let orders: any[];
  const accounts: any[] = [
    { username: 'li1', mode: 'test' },
    { username: 'li2', mode: 'test' },
    { username: 'li3', mode: 'test' }
  ];

  before(function(done) {
    db.init(cfg.DATABASE).then((dbClient: any) => {
      clientConnection = dbClient;
      oo = new Order(db);
      ao = new Account(db);
      cbo = new ClientBalance(db);

      ao.insertMany(accounts).then((rs: any[]) => {
        acs = rs;
        for(let i=0; i< accounts.length; i++){
          expect(rs[i].username).to.equal(accounts[i].username);
        }

        orders = [
          { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
          groupDiscount: 0, total:8.5 },
          { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
          groupDiscount: 2, total:9.5 },
        ];
  
        // const order = {clientId:c, delivered:x, address:y, groupDiscount: z};
        oo.insertMany(orders).then((os: any[]) => {
          ors = os;

          const balances = [
            { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
            { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
            { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
          ];
          cbo.insertMany(balances).then((bs: any[]) => {
            done();
          });
        });
      });
    });
  });

  after(function(done) {
    const accountIds: any[] = [];
    const orderIds: any[] = [
      {id: ors[0].id.toString()},
      {id: ors[1].id.toString()}
    ];
    const cIds: any[] = [];
    acs.map(r => { 
      accountIds.push({ id: r.id.toString() });
      cIds.push({accountId: r.id.toString()});
    });
    ao.bulkDelete(accountIds).then((y: any) => {
      expect(y.deletedCount).to.equal(3);
      oo.bulkDelete(orderIds).then((y2: any) => {
        expect(y2.deletedCount).to.equal(2);
        cbo.bulkDelete(cIds).then((y3: any) => {
          clientConnection.close();
          done();
        });
      });
    });
  });

  it('should the 1st order has group discount 2', (done) => {
    cbo.addGroupDiscountForBalances(ors).then((updates: any[]) => {
      const cIds: string[] = [];
      orders.map((o: any) => { cIds.push(o.clientId); });

      cbo.find({accountId: {$in: cIds}}).then((cbs: any[]) => {
        const cb0 = cbs.find((x:any) => x.accountId === orders[0].clientId);
        const cb1 = cbs.find((x:any) => x.accountId === orders[1].clientId);
        expect(cb0.amount).to.equal(0); // got groupDiscount from front end already
        expect(cb1.amount).to.equal(0);
        done();
      });
    });
  });
});

describe('addGroupDiscountForBalances with one order', () => {
  const db: any = new DB();
  const cfg: any = new Config();
  let clientConnection: any = null;
  let oo: Order;
  let ao: Account;
  let cbo: ClientBalance;
  let acs: any[];
  let ors: any[];
  let orders: any[];
  const accounts: any[] = [
    { username: 'li1', mode: 'test' },
    { username: 'li2', mode: 'test' },
    { username: 'li3', mode: 'test' }
  ];

  before(function(done) {
    db.init(cfg.DATABASE).then((dbClient: any) => {
      oo = new Order(db);
      ao = new Account(db);
      cbo = new ClientBalance(db);
      clientConnection = dbClient;

      ao.insertMany(accounts).then((rs: any[]) => {
        acs = rs;
        for(let i=0; i< accounts.length; i++){
          expect(rs[i].username).to.equal(accounts[i].username);
        }

        orders = [
          { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', 
          delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
        ];
  
        oo.insertMany(orders).then((os: any[]) => {
          ors = os;
          const balances = [
            { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
            { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
            { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
          ];
          cbo.insertMany(balances).then((bs: any[]) => {
            done();
          });
        });
      });
    });
  });

  after(function(done) {
    const accountIds: any[] = [];
    const orderIds: any[] = [
      {id: ors[0].id.toString()}
    ];
    const cIds: any[] = [];
    acs.map(r => { 
      accountIds.push({ id: r.id.toString() });
      cIds.push({accountId: r.id.toString()});
    });
    ao.bulkDelete(accountIds).then((y: any) => {
      expect(y.deletedCount).to.equal(3);
      oo.bulkDelete(orderIds).then((y2: any) => {
        expect(y2.deletedCount).to.equal(1);
        cbo.bulkDelete(cIds).then((y3: any) => {
          clientConnection.close();
          done();
        });
      });
    });
  });

  it('should update orders with group discount', (done) => {
    cbo.addGroupDiscountForBalances(ors).then((orderUpdates: any[]) => {
      const cIds: string[] = [];
      ors.map((o: any) => {
        cIds.push(o.clientId);
      });
      oo.find({clientId: acs[1].id.toString()}).then( (o1s: any[]) => {
        expect(o1s.length).to.equal(1);
        expect(o1s[0].groupDiscount).to.equal(2);
        expect(o1s[0].total).to.equal(9.5);
        done();
      });
      // oo.find({clientId: {$in: cIds}}).then((o1s: any[]) => {
      //   const order0 = o1s.find((x:any) => x.clientId === acs[1].id.toString());
      //   expect(order0.groupDiscount).to.equal(0); // got groupDiscount from front end
      //   expect(order0.total).to.equal(11.5); // got groupDiscount from front end already
      //   done();
      // });
    });
  });
});

describe('removeGroupDiscountForBalances with 2 different account orders', () => {
  const db: any = new DB();
  const cfg: any = new Config();
  let clientConnection: any = null;
  let oo: Order;
  let ao: Account;
  let cbo: ClientBalance;
  let acs: any[];
  let ors: any[];
  let orders: any[];
  const accounts: any[] = [
    { username: 'li1', mode: 'test' },
    { username: 'li2', mode: 'test' },
    { username: 'li3', mode: 'test' }
  ];

  before(function(done) {
    db.init(cfg.DATABASE).then((dbClient: any) => {
      clientConnection = dbClient;
      oo = new Order(db);
      ao = new Account(db);
      cbo = new ClientBalance(db);

      ao.insertMany(accounts).then((rs: any[]) => {
        acs = rs;
        for(let i=0; i< accounts.length; i++){
          expect(rs[i].username).to.equal(accounts[i].username);
        }

        orders = [
          { mode: 'test', clientId: rs[0].id.toString(), clientName: rs[0].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
          groupDiscount: 0, total:8.5 },
          { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', delivered: '2019-04-23T15:45:00.000Z',
          groupDiscount: 2, total:9.5 },
        ];
  
        // const order = {clientId:c, delivered:x, address:y, groupDiscount: z};
        oo.insertMany(orders).then((os: any[]) => {
          ors = os;

          const balances = [
            { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
            { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
            { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
          ];
          cbo.insertMany(balances).then((bs: any[]) => {
            done();
          });
        });
      });
    });
  });

  after(function(done) {
    const accountIds: any[] = [];
    const orderIds: any[] = [
      {id: ors[0].id.toString()},
      {id: ors[1].id.toString()}
    ];
    const cIds: any[] = [];
    acs.map(r => { 
      accountIds.push({ id: r.id.toString() });
      cIds.push({accountId: r.id.toString()});
    });
    ao.bulkDelete(accountIds).then((y: any) => {
      expect(y.deletedCount).to.equal(3);
      oo.bulkDelete(orderIds).then((y2: any) => {
        expect(y2.deletedCount).to.equal(2);
        cbo.bulkDelete(cIds).then((y3: any) => {
          clientConnection.close();
          done();
        });
      });
    });
  });

  it('should the 1st order has group discount 2', (done) => {
    cbo.removeGroupDiscountForBalances(ors).then((updates: any[]) => {
      const cIds: string[] = [];
      orders.map((o: any) => { cIds.push(o.clientId); });

      cbo.find({accountId: {$in: cIds}}).then((cbs: any[]) => {
        const cb0 = cbs.find((x:any) => x.accountId === orders[0].clientId);
        const cb1 = cbs.find((x:any) => x.accountId === orders[1].clientId);
        expect(cb0.amount).to.equal(0); // got groupDiscount from front end already
        expect(cb1.amount).to.equal(0);
        done();
      });
    });
  });
});


describe('removeGroupDiscountForBalances with one order', () => {
  const db: any = new DB();
  const cfg: any = new Config();
  let clientConnection: any = null;
  let oo: Order;
  let ao: Account;
  let cbo: ClientBalance;
  let acs: any[];
  let ors: any[];
  let orders: any[];
  const accounts: any[] = [
    { username: 'li1', mode: 'test' },
    { username: 'li2', mode: 'test' },
    { username: 'li3', mode: 'test' }
  ];

  before(function(done) {
    db.init(cfg.DATABASE).then((dbClient: any) => {
      oo = new Order(db);
      ao = new Account(db);
      cbo = new ClientBalance(db);
      clientConnection = dbClient;

      ao.insertMany(accounts).then((rs: any[]) => {
        acs = rs;
        for(let i=0; i< accounts.length; i++){
          expect(rs[i].username).to.equal(accounts[i].username);
        }

        orders = [
          { mode: 'test', clientId: rs[1].id.toString(), clientName: rs[1].username, address:'abc', 
          delivered: '2019-04-23T15:45:00.000Z', groupDiscount: 2, total:9.5 },
        ];
  
        oo.insertMany(orders).then((os: any[]) => {
          ors = os;
          const balances = [
            { mode: 'test', accountId: rs[0].id.toString(), clientName: rs[0].username, amount:-2},
            { mode: 'test', accountId: rs[1].id.toString(), clientName: rs[1].username, amount:0},
            { mode: 'test', accountId: rs[2].id.toString(), clientName: rs[2].username, amount:2},
          ];
          cbo.insertMany(balances).then((bs: any[]) => {
            done();
          });
        });
      });
    });
  });

  after(function(done) {
    const accountIds: any[] = [];
    const orderIds: any[] = [
      {id: ors[0].id.toString()}
    ];
    const cIds: any[] = [];
    acs.map(r => { 
      accountIds.push({ id: r.id.toString() });
      cIds.push({accountId: r.id.toString()});
    });
    ao.bulkDelete(accountIds).then((y: any) => {
      expect(y.deletedCount).to.equal(3);
      oo.bulkDelete(orderIds).then((y2: any) => {
        expect(y2.deletedCount).to.equal(1);
        cbo.bulkDelete(cIds).then((y3: any) => {
          clientConnection.close();
          done();
        });
      });
    });
  });

  it('should update orders with group discount', (done) => {
    cbo.removeGroupDiscountForBalances(ors).then((orderUpdates: any[]) => {
      const cIds: string[] = [];
      ors.map((o: any) => {
        cIds.push(o.clientId);
      });
      oo.find({clientId: acs[1].id.toString()}).then( (o1s: any[]) => {
        expect(o1s.length).to.equal(1);
        expect(o1s[0].groupDiscount).to.equal(2); //unchange order
        expect(o1s[0].total).to.equal(9.5);

        cbo.find({accountId: acs[1].id.toString()}).then((cbs:any[]) => {
          expect(cbs[0].amount).to.equal(-2);
          done();
        });
      });
    });
  });
});