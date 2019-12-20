import { DB } from "../db";
import { Model } from "./model";

import { Entity } from "../entity";
import { Category } from "./category";
import { ObjectID, Collection } from "mongodb";
import { Request, Response } from "express";
import { Account, IAccount } from "./account";

export interface IProduct {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  merchantId: string;   // merchant account _id !
  categoryId: string;

  merchant?: IAccount; // join account table from find()

  openDays?: number[];
  // restaurant?: IMerchant; // ??
  // category?: ICategory;
  // pictures?: Picture[];
  dow?: string[];
  order?: number;
  status?: string;
  created?: string;
  modified?: string;
}

export class Product extends Model {
  categoryModel: Category;
  accountModel: Account;
  constructor(dbo: DB) {
    super(dbo, 'products');
    this.categoryModel = new Category(dbo);
    this.accountModel = new Account(dbo);
  }

  uploadPicture(req: Request, res: Response){
    const fname = req.body.fname + '.' + req.body.ext;
    if(fname){
      res.send(JSON.stringify({fname: fname, url: fname}, null, 3));
    }else{
      res.send(JSON.stringify(null, null, 3))
    }
  }

  list(req: Request, res: Response) {
    let query = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    query = this.convertIdFields(query);
    this.categoryModel.find({}).then(cs => {
      this.accountModel.find({}).then(ms => { // fix me, arch design issue: merchant or account ???
        this.find(query).then(ps => {
          ps.map((p: any) => {
            p.category = cs.find((c: any) => c && c._id && p && p.categoryId && c._id.toString() === p.categoryId.toString());
            const merchant = ms.find((m: any) => m && m._id && p && p.merchantId && m._id.toString() === p.merchantId.toString());
            if(merchant && merchant.password){
              delete merchant.password;
            }
            if(merchant){ // fix me
              merchant.name = merchant.username;
            }
            p.merchant = merchant;
          });

          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(ps, null, 3));
        });
      });
    });

    // let query = null;
    // if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
    //   query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    // }

    // let q = query;
    // if (q) {
    //   if (q.where) {
    //     q = query.where;
    //   }
    // } else {
    //   q = {};
    // }

    // if(q && q.merchantId){
    //   q.merchantId = new ObjectID(q.merchantId);
    // }

    // if(q && q.categoryId){
    //   q.categoryId = new ObjectID(q.categoryId);
    // }

    // const params = [
    //   {$lookup:{from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'}},
    //   {$unwind:'$category'},
    //   {$lookup:{from: 'restaurants', localField: 'merchantId', foreignField: '_id', as: 'merchant'}},
    //   {$unwind:'$merchant'}
    // ];
    // this.join(params, q).then((rs: any) => {
    //   res.setHeader('Content-Type', 'application/json');
    //   if (rs) {
    //     res.send(JSON.stringify(rs, null, 3));
    //   } else {
    //     res.send(JSON.stringify(null, null, 3))
    //   }
    // });
  }

  // load(req: Request, res: Response) {
  //   let query = null;
  //   let key = null;
  //   if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
  //     query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
  //   }
  //   if (req.headers && req.headers.distinct && typeof req.headers.distinct === 'string') {
  //     key = (req.headers && req.headers.distinct) ? JSON.parse(req.headers.distinct) : null;
  //   }

  //   let q = query;
  //   if (q) {
  //     if (q.where) {
  //       q = query.where;
  //     }
  //   } else {
  //     q = {};
  //   }

  //   if (key && key.distinct) {
  //     this.distinct(key.distinct, q).then((x: any) => {
  //       res.setHeader('Content-Type', 'application/json');
  //       res.end(JSON.stringify(x, null, 3));
  //     });
  //   } else {
  //     this.find(q).then((x: any) => {
  //       res.setHeader('Content-Type', 'application/json');
  //       res.end(JSON.stringify(x, null, 3));
  //     });
  //   }
  // }

  // doLoad(q){
  //   return new Promise( (resolve)
  //   this.find(q).then((x: any) => {
  //     // res.setHeader('Content-Type', 'application/json');
  //     // res.end(JSON.stringify(x, null, 3));
  //   });
  // }
}