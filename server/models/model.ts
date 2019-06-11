import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "../db";
import { Entity } from "../entity";

export class Model extends Entity {
  constructor(dbo: DB, tableName: string) {
    super(dbo, tableName);
  }

  list(req: Request, res: Response) {
    let query = null;
    let key = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    if (req.headers && req.headers.distinct && typeof req.headers.distinct === 'string') {
      key = (req.headers && req.headers.distinct) ? JSON.parse(req.headers.distinct) : null;
    }

    let q = query;
    if (q) {
      if (q.where) {
        q = query.where;
      }
    } else {
      q = {};
    }


    if (key && key.distinct) {
      this.distinct(key.distinct, q).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    } else {
      this.find(q).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    }

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
    if (req.body instanceof Array) {
      this.insertMany(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x.ops, null, 3));
      });
    } else {
      this.insertOne(req.body).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
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
    if (req.body.data instanceof Array) {
      this.bulkUpdate(req.body.data, req.body.options);
      res.end();
    } else {
      if (req.body && req.body.filter) {
        this.updateOne(req.body.filter, req.body.data, req.body.options).then((x: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(x.result, null, 3)); // {n: 1, nModified: 1, ok: 1}
        });
      } else {
        res.end();
      }
    }
  }

  remove(req: Request, res: Response) {
    let query: any = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    this.find(query ? query.where : { id: "-1" }).then((assignments: any) => {
      if (assignments && assignments.length > 0) {
        this.deleteMany(query ? query.where : {}).then((x: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(x, null, 3));
        });
      } else {
        res.end(null);
      }
    });
  }

  removeOne(req: Request, res: Response) {
    this.deleteById(req.params.id).then(x => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(x, null, 3));
    });
  }
}