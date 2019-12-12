import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Product } from "./product";
import { Account } from "./account";

export enum CellApplicationStatus {
  APPLIED = 1,    // submit application form but didn't submit setup fee page
  ORDERED,        // submit setup fee page but unpaid
  SETUP_PAID      // paid setup fee
}

export class CellApplication extends Model {
  productModel: Product;
  accountModel: Account;

  constructor(dbo: DB) {
    super(dbo, 'cell_applications');
    this.productModel = new Product(dbo);
    this.accountModel = new Account(dbo);
  }

  list(req: Request, res: Response) {
    let query = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    query = this.convertIdFields(query);
    this.productModel.find({}).then(ps => {
      this.accountModel.find({}).then(accounts => {
        this.find(query).then(cas => {
          cas.map((ca: any) => {
            ca.product = ps.find((p: any) => p._id.toString() === ca.productId.toString());
            ca.account = accounts.find((a: any) => a._id.toString() === ca.accountId.toString());
          });

          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(cas, null, 3));
        });
      });
    });
  }
}