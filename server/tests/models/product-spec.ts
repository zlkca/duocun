// import { Product, IProduct } from '../../models/product';
// import { Category } from '../../models/category';

// import { Config } from '../../config';
// import { DB } from '../../db';
// import { expect } from 'chai';

// describe('joinFind product with category', () => {
//   const db: any = new DB();
//   const cfg: any = new Config();
//   let clientConnection: any = null;
//   let po: Product;
//   let co: Category;

//   const d1 = {pId: '5ded9c186c52fa04402e2aeb', cId: '5c9543430851a5096e044d17', mId:'5ded91a7707f730f042d2f58'}

//   before(function(done) {
//     db.init(cfg.DATABASE).then((dbClient: any) => {
//       clientConnection = dbClient;
//       po = new Product(db);
//       co = new Category(db);
//       done();
//     });
//   });

//   after(function(done) {
//     clientConnection.close();
//     done();
//   });

//   it('should return product with category', (done) => {
//     po.joinFind({_id: d1.pId}).then(ps => {
//       expect(ps.length).to.equal(1);
//       const p: IProduct = ps[0];
//       const category: any = p.category;
//       const merchant: any = p.merchant;
//       expect(category._id.toString()).to.equal(d1.cId);
//       expect(merchant._id.toString()).to.equal(d1.mId);
//       done();
//     });
//   });

// });

