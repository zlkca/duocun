import { DB } from "../db";
import { Model } from "./model";

import { Entity } from "../entity";
import { Category } from "./category";
import { Merchant, IMerchant } from "./merchant";

import { ObjectID, Collection } from "mongodb";
import { Request, Response } from "express";
import { Account, IAccount } from "./account";
import { resolve } from "../../node_modules/@types/q";

export enum ProductStatus {
  ACTIVE = 1,
  INACTIVE,
  NEW,
  PROMOTE
}

export interface ICategory {
  _id?: string;
  name: string;
  description: string;
  order: number;

  created?: string;
  modified?: string;
}

export interface IProduct {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  merchantId: string;
  categoryId: string;

  openDays?: number[];

  // pictures?: Picture[];
  dow?: string[];
  order?: number;
  status?: ProductStatus;

  created?: string;
  modified?: string;

  merchant?: IMerchant;
  category?: ICategory;
  merchantAccount?: IAccount; // join account table from find()
}

export class Product extends Model {
  categoryModel: Category;
  accountModel: Account;
  merchantModel: Merchant;
  constructor(dbo: DB) {
    super(dbo, 'products');
    this.categoryModel = new Category(dbo);
    this.accountModel = new Account(dbo);
    this.merchantModel = new Merchant(dbo);
  }

  uploadPicture(req: Request, res: Response) {
    const fname = req.body.fname + '.' + req.body.ext;
    if (fname) {
      res.send(JSON.stringify({ fname: fname, url: fname }, null, 3));
    } else {
      res.send(JSON.stringify(null, null, 3))
    }
  }

  list(req: Request, res: Response) {
    let query = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    this.joinFind(query).then(ps => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(ps, null, 3));
    });
  }

  joinFind(query: any): Promise<IProduct[]> {
    return new Promise((resolve, reject) => {
      this.accountModel.find({}).then(accounts => {
        this.categoryModel.find({}).then(cs => {
          this.merchantModel.find({}).then(ms => { // fix me, arch design issue: merchant or account ???
            this.find(query).then(ps => {
              ps.map((p: IProduct) => {
                p.category = cs.find((c: any) => c && c._id && p && p.categoryId && c._id.toString() === p.categoryId.toString());
                p.merchant = ms.find((m: any) => m && m._id && p && p.merchantId && m._id.toString() === p.merchantId.toString());
                const merchant: any = p.merchant;
                p.merchantAccount = accounts.find((a: any) => a && merchant && a._id.toString() === merchant.accountId.toString());
              });
              resolve(ps);
            });
          });
        });
      });
    });
  }
}