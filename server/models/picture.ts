import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { Model } from "./model";
import { DB } from "../db";

export class Picture extends Model {
  constructor(dbo: DB) {
    super(dbo, 'products');
  }

  get(req: Request, res: Response){
    const id = req.params.id;
    const dir = path.join(__dirname, '../uploads');
    fs.readdir(dir, (err, fnames) => {
      res.send(JSON.stringify(fnames, null, 3));
    });    
    // this.findOne({_id: new ObjectID(id)}).then((r: any) => {
    //   if(r){
    //     res.send(JSON.stringify(r, null, 3));
    //   }else{
    //     res.send(JSON.stringify(null, null, 3))
    //   }
    // });
  }
}