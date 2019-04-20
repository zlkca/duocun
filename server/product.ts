import { Request, Response } from "express";
import { ObjectID, Collection } from "mongodb";
import { DB } from "./db";
import { Entity } from "./entity";

export class Product extends Entity{

  constructor(dbo: DB) {
		super(dbo, 'products');
  }

  // only by id
  get(req: Request, res: Response){
    const id = req.params.id;
    
    this.findOne({_id: new ObjectID(id)}).then((r: any) => {
      if(r){
        res.send(JSON.stringify(r, null, 3));
      }else{
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  uploadPicture(req: Request, res: Response){
    const fname = req.body.fname + '.' + req.body.ext;
    if(fname){
      res.send(JSON.stringify({fname: fname, url: fname}, null, 3));
    }else{
      res.send(JSON.stringify(null, null, 3))
    }
  }

  find(query: any, options?: any): Promise<any> {
    const self = this;
    if (query && query.hasOwnProperty('id')) {
      let body = query.id;
      if (body && '$in' in body) {
        let a = body['$in'];
        const arr: any[] = [];
        a.map((id: string) => {
          arr.push({_id: new ObjectID(id)});
        });

        query = { $or: arr };
      }
    }

    if (query && query.hasOwnProperty('dow')) {
      const dow = query.dow.toString();
      query['dow'] = { $in:[ dow, 'all'] };
    }

    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.find(query, options).toArray((err, docs) => {
          let s:any[] = [];
          if(docs && docs.length > 0){
            docs.map((v, i) => {
              if(v && v._id){
                v.id = v._id;
                delete(v._id);
              }
              s.push(v);
            });
          }
          resolve(s);
        });
      });
    });
  }
}