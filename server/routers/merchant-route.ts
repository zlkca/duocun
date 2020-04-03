import express from "express";
import { Request, Response } from "express";
import moment from "moment";
import { DB } from "../db";
import { Merchant } from "../models/merchant";
import { ObjectID } from "../../node_modules/@types/mongodb";

export class MerchantRouter {
  router = express.Router();
  model: Merchant;

  constructor(db: DB) {
    this.model = new Merchant(db);
  }

  init() {
    // v2
    this.router.get('/v2/myMerchants', (req, res) => { this.getMyMerchants(req, res); });
    this.router.get('/v2/mySchedules', (req, res) => { this.getMySchedules(req, res); })
    this.router.get('/getByAccountId', (req, res) => { this.getByAccountId(req, res); });
    this.router.get('/qFind', (req, res) => { this.quickFind(req, res); });
    this.router.get('/:id', (req, res) => { this.get(req, res); });
    this.router.get('/', (req, res) => { this.model.list(req, res); });

    // v1

    this.router.post('/load', (req, res) => { this.load(req, res); });
    // this.router.post('/', (req, res) => { this.create(req, res); });
    // this.router.put('/', (req, res) => { this.replace(req, res); });
    // this.router.patch('/', (req, res) => { this.update(req, res); });
    // this.router.delete('/', (req, res) => { this.remove(req, res); });

    return this.router;
  }

  list(req: Request, res: Response) {
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    query = this.model.convertIdFields(query);

    this.model.joinFind(query).then((rs: any[]) => {
      // const rs: IMerchant[] = [];
      // ms.map(m => {
      //   rs.push(this.toBasicRspObject(m));
      // });
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  getMySchedules(req: Request, res: Response) {
    let fields: any;
    let data: any;
    if (req.headers) {
      if (req.headers.filter && typeof req.headers.filter === 'string') {
        data = JSON.parse(req.headers.filter);
      }
      if (req.headers.fields && typeof req.headers.fields === 'string') {
        fields = JSON.parse(req.headers.fields);
      }
    }
    const merchantId = data.merchantId;
    const location = data.location;
    this.model.getMySchedules(location, merchantId, fields).then((rs: any[]) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(rs, null, 3));
    });
  }

  getMyMerchants(req: Request, res: Response) {
    let fields: any;
    let data: any;
    if (req.headers) {
      if (req.headers.filter && typeof req.headers.filter === 'string') {
        data = JSON.parse(req.headers.filter);
      }
      if (req.headers.fields && typeof req.headers.fields === 'string') {
        fields = JSON.parse(req.headers.fields);
      }
    }
    const query = data.query;
    const location = data.location;
    this.model.getMyMerchants(location, query, fields).then((rs: any[]) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(rs, null, 3));
    });
  }

  getByAccountId(req: Request, res: Response) {
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    const merchantAccountId = query.id;
    this.model.getByAccountId(merchantAccountId).then((rs: any[]) => {
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
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

    this.model.find(query, null, fields).then((xs: any[]) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(xs, null, 3));
    });
  }


  get(req: Request, res: Response) {
    const id = req.params.id;
    let fields: any;
    if (req.headers) {
      if (req.headers.fields && typeof req.headers.fields === 'string') {
        fields = JSON.parse(req.headers.fields);
      }
    }

    this.model.findOne({ _id: id }).then((r: any) => {
      if (r) {
        const it = this.model.filter(r, fields);
        res.send(JSON.stringify(it, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }


  // load restaurants
  // origin --- ILocation object
  // dateType --- string 'today', 'tomorrow'
  load(req: Request, res: Response) {
    const origin = req.body.origin;
    const dateType = req.body.dateType;
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    
    const dt = dateType === 'today' ? moment() : moment().add(1, 'days');
    this.model.loadByDeliveryInfo(query, dt, origin).then((rs: any) => {
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }
};