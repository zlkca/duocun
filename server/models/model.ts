import { Request, Response } from "express";
import { ObjectID } from "mongodb";
import { DB } from "../db";

import { Entity } from "../entity";
import moment from "moment";

export class Model extends Entity {
  constructor(dbo: DB, tableName: string) {
    super(dbo, tableName);
  }

  // m --- local moment object for date, m.isUTC() must be false
  // t --- string, eg: '11:20'
  // return moment object 
  getLocalTime(m: moment.Moment, t: string) {
    const hour = +(t.split(':')[0]);
    const minute = +(t.split(':')[1]);
    return m.set({ hour: hour, minute: minute, second: 0, millisecond: 0 });
  }

  quickFind(req: Request, res: Response) {
    let query = {};
    let fields: any;
    if (req.headers) {
      if (req.headers.filter && typeof req.headers.filter === 'string') {
        query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
      }

      if (req.headers.fields && typeof req.headers.fields === 'string') {
        fields = JSON.parse(req.headers.fields);
      }
    }

    this.find(query).then((xs: any[]) => {
      res.setHeader('Content-Type', 'application/json');
      if (fields && fields.length > 0) {
        const rs: any[] = [];

        xs.map((x: any) => {
          const it: any = {};
          fields.map((key: any) => {
            it[key] = x[key];
          });

          rs.push(it);
        });

        res.end(JSON.stringify(rs, null, 3));
      } else {
        res.end(JSON.stringify(xs, null, 3));
      }
    });
  }

  list(req: Request, res: Response) {
    let query = {};
    let key = null;
    let fields: any = null;
    if (req.headers) {
      if (req.headers.filter && typeof req.headers.filter === 'string') {
        query = req.headers.filter ? JSON.parse(req.headers.filter) : null;
      }

      if (req.headers.distinct && typeof req.headers.distinct === 'string') {
        key = req.headers.distinct ? JSON.parse(req.headers.distinct) : null;
      }

      if (req.headers.fields && typeof req.headers.fields === 'string') {
        fields = JSON.parse(req.headers.fields);
      }
    }

    if (key && key.distinct) {
      this.distinct(key.distinct, query).then((x: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    } else {
      this.find(query).then((xs: any) => {
        res.setHeader('Content-Type', 'application/json');
        if (fields && fields.length > 0) {
          const rs: any[] = [];
  
          xs.map((x: any) => {
            const it: any = {};
            fields.map((key: any) => {
              it[key] = x[key];
            });
  
            rs.push(it);
          });
  
          res.end(JSON.stringify(rs, null, 3));
        } else {
          res.end(JSON.stringify(xs, null, 3));
        }
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

  // join2(req: Request, res: Response) {
  //   const from = req.body.fromCollection;
  //   const localField = req.body.localField;
  //   const foreignField = req.body.foreignField;
  //   const as = req.body.as;
  //   const query = req.body.query;
  //   this.join(from, localField, foreignField, as, query).then((rs: any) => {
  //     if (rs) {
  //       res.send(JSON.stringify(rs, null, 3));
  //     } else {
  //       res.send(JSON.stringify(null, null, 3))
  //     }
  //   });
  // }

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
      this.bulkUpdate(req.body.data, req.body.options).then(x => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3)); // x --- {status: 1, msg: ''}
      });
    } else {
      if (req.body && req.body.filter) {
        this.updateOne(req.body.filter, req.body.data, req.body.options).then((x: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(x ? JSON.stringify(x, null, 3) : ''); // {n: 1, nModified: 1, ok: 1}
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

    this.find(query ? query : { _id: "-1" }).then((rs: any) => {
      if (rs && rs.length > 0) {
        this.deleteMany(query ? query : { _id: "-1" }).then((x: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(x, null, 3));
        });
      } else {
        res.end(null);
      }
    });
  }

  removeOne(req: Request, res: Response) {
    const id: string = req.params.id;
    if (id) {
      this.deleteById(id).then(x => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(x, null, 3));
      });
    } else {
      res.end(JSON.stringify('failed', null, 3));
    }
  }

  groupBy(items: any[], key: string) {
    let groups = items.reduce((result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }), {});

    Object.keys(groups).map(key => {
      key === 'undefined' ? delete groups[key] : '';
    });

    return groups;
  }

  upsertOne(req: Request, res: Response) {
    const query = req.body.query;
    const data = req.body.data;

    this.updateOne(query, data, { upsert: true }).then((result) => { // {n: 1, nModified: 0, ok: 1}
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result, null, 3));
    });
  }
}