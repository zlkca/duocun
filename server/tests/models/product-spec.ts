import { Product } from '../../models/product';
import { Category } from '../../models/category';

import { Config } from '../../config';
import { DB } from '../../db';
import { expect } from 'chai';

describe('lookup product with category', () => {
  const db: any = new DB();
  const cfg: any = new Config();
  let clientConnection: any = null;
  let po: Product;
  let co: Category;

  before(function(done) {
    db.init(cfg.DATABASE).then((dbClient: any) => {
      clientConnection = dbClient;
      po = new Product(db);
      co = new Category(db);
      done();
    });
  });

  after(function(done) {
    clientConnection.close();
  });

  it('should return product with category', (done) => {
    po.find({}).then(ps => {
      co.find({}).then(cs => {
        const param = [{from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'}];
        po.join(param).then(xs => {
          expect(xs.length).to.equal(ps.length);
          const c = cs.find((c:any) => c._id.toString() === ps[0].categoryId.toString());
          const p = xs.find((x:any) => x._id.toString() === ps[0]._id.toString());
          expect(c._id.toString()).to.equal(p.categoryId.toString());
          done();
        });
      });
    });
  });

  it('should return product with category', (done) => {
    po.find({}).then(ps => {
      co.find({}).then(cs => {
        const param = [
          {from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'},
          {from: 'restaurants', localField: 'merchantId', foreignField: '_id', as: 'merchant'}
        ];
        po.join(param, {cost: 7}).then(xs => {
          // expect(xs.length).to.equal(ps.length); // fix me
          const c = cs.find((c:any) => c._id.toString() === ps[0].categoryId.toString());
          const p = xs.find((x:any) => x._id.toString() === ps[0]._id.toString());
          expect(c._id.toString()).to.equal(p.categoryId.toString());
          done();
        });
      });
    });
  });
});

