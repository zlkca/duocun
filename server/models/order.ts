import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "../db";
import { Entity } from "../entity";

export class Order extends Entity {
  constructor(dbo: DB) {
    super(dbo, 'orders');
  }

  list(req: Request, res: Response) {
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

  create(req: Request, res: Response) {
    if (req.body.isArray()) {
      this.insertMany(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    } else {
      this.insertOne(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        // fix me
        // io.emit('updateOrders', x);
        res.end(JSON.stringify(x, null, 3));
      });
    }
  }

  replace(req: Request, res: Response) {
    this.replaceById(req.body.id, req.body).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      // io.emit('updateOrders', x);
      res.end(JSON.stringify(x, null, 3));
    });
  }

  update(req: Request, res: Response) {
    this.updateOne(req.body.filter, req.body.data).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(x.result, null, 3)); // {n: 1, nModified: 1, ok: 1}
    });
  }

  remove(req: Request, res: Response) {

  }

  removeOne(req: Request, res: Response) {
    this.deleteById(req.params.id).then(x => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(x, null, 3));
    });
  }
}