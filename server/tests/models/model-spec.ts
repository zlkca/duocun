import { Order } from "../../models/order";
import { DB } from "../../db";
import { expect } from 'chai';

describe('groupBy', () => {
  it('should return grouped orders', () => {
    const db = new DB();
    const c = new Order(db);

    const orders: any[] = [
      { id: 'a', clientId: 'a', groupDiscount: 1, total: 1 },
      { id: 'b', clientId: 'a', groupDiscount: 2, total: 1 },
      { id: 'c', clientId: 'a', groupDiscount: 0, total: 1 },
      { id: 'd', clientId: 'b', groupDiscount: 0, total: 1 }, // take
      { id: 'e', clientId: 'b', groupDiscount: 1, total: 3 }, // take
      { id: 'f', clientId: 'c', groupDiscount: 0, total: 2 }, // take
      { id: 'g', groupDiscount: 0, total: 2 },
      { id: 'h', clientId: 'c', groupDiscount: 2 },
      { id: 'i', clientId: 'd', groupDiscount: 0 }, // take
      { id: 'j', price: 5 },
      { id: 'k', clientId: 'd', groupDiscount: 0 },
    ];

    const a = c.groupBy(orders, 'clientId');

    expect(a['a'].length).to.equal(3);
    expect(a['b'].length).to.equal(2);
    expect(a['c'].length).to.equal(2);
    expect(a['d'].length).to.equal(2);
  });
});