import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";

export class Product extends Model {
  constructor(dbo: DB) {
    super(dbo, 'products');
  }

  uploadPicture(req: Request, res: Response){
    const fname = req.body.fname + '.' + req.body.ext;
    if(fname){
      res.send(JSON.stringify({fname: fname, url: fname}, null, 3));
    }else{
      res.send(JSON.stringify(null, null, 3))
    }
  }
}