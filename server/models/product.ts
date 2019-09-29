import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Entity } from "../entity";
import { Category } from "./category";

export class Product extends Model {
  categoryModel: Category;
  constructor(dbo: DB) {
    super(dbo, 'products');
    this.categoryModel = new Category(dbo);
  }

  uploadPicture(req: Request, res: Response){
    const fname = req.body.fname + '.' + req.body.ext;
    if(fname){
      res.send(JSON.stringify({fname: fname, url: fname}, null, 3));
    }else{
      res.send(JSON.stringify(null, null, 3))
    }
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