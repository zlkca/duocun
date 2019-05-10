import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "../db";
import { Entity } from "../entity";

export class Assignment extends Entity{
  constructor(dbo: DB) {
		super(dbo, 'assignments');
  }

  // get(req: Request, res: Response){
  //   const id = req.params.id;
  //   this.findOne({_id: new ObjectID(id)}).then((r: any) => {
  //     if(r){
  //       res.send(JSON.stringify(r, null, 3));
  //     }else{
  //       res.send(JSON.stringify(null, null, 3))
  //     }
  //   });
  // }

  list(req: Request, res: Response){
    let query = null;
    if(req.headers && req.headers.filter && typeof req.headers.filter === 'string'){
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    this.find(query ? query.where : {}).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(x, null, 3));
    });
  }

  get(req: Request, res: Response) {
    const id = req.params.id;
    if (id) {
      this.findOne({ _id: new ObjectID(id) }).then((r: any) => {
        if (r) {
          res.send(JSON.stringify(r, null, 3));
        } else {
          res.send(JSON.stringify(null, null, 3))
        }
      });
    }
  }

  create(req: Request, res: Response){
    if(req.body instanceof Array){
      this.insertMany(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x.ops, null, 3));
      });
    }else{
      this.insertOne(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    }
  }

  replace(req: Request, res: Response){
  
  }

  update(req: Request, res: Response){
  
  }

  remove(req: Request, res: Response){
    let query: any = null;
    if(req.headers && req.headers.filter && typeof req.headers.filter === 'string'){
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    this.find(query ? query.where : {}).then((assignments: any) => {
      if(assignments && assignments.length>0){
        this.deleteMany(query ? query.where : {}).then((x: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(x, null, 3));
        });
      }else{
        res.end(null);
      }
    });
  }

}