import express from "express";
import { Area, IArea } from "../models/area";
import { DB } from "../db";
import { Request, Response } from "express";

export class AreaRouter{
  router = express.Router();
  model: Area;
  constructor(db: DB) {
    this.model = new Area(db);
  }

  init(){
    // v1
    this.router.get('/my', (req, res) => { this.reqMyArea(req, res); }); // fix me
    this.router.get('/qFind', (req, res) => { this.quickFind(req, res); });

    // fix me
    // this.router.get('/', (req, res) => { this.list(req, res); });
    // this.router.get('/:id', (req, res) => { this.get(req, res); });
    
    this.router.post('/nearest', (req, res) => {this.getNearest(req, res); });
    
    // this.router.post('/', (req, res) => { this.create(req, res); });
    // this.router.put('/', (req, res) => { this.replace(req, res); });
    // this.router.patch('/', (req, res) => { this.update(req, res); });
    // this.router.delete('/', (req, res) => { this.remove(req, res); });
    
    return this.router;
  }

  getNearest(req: Request, res: Response) {
    const origin = req.body.origin;
    this.model.getNearestArea(origin).then((area: IArea) => {
      res.setHeader('Content-Type', 'application/json');
      if (!area) {
        res.send(JSON.stringify({ status: 'fail', area: '' }, null, 3));
      } else {
        res.send(JSON.stringify({ status: 'success', area: area }, null, 3));
      }
    });
  }

  reqMyArea(req: Request, res: Response) {
    let data;
    let fields;
    if (req.headers) {
      if (req.headers.data && typeof req.headers.data === 'string') {
        data = JSON.parse(req.headers.data);
      }

      if (req.headers.fields && typeof req.headers.fields === 'string') {
        fields = JSON.parse(req.headers.fields);
      }
    }
    this.model.getMyArea(data.location).then(area => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(area, null, 3));
    });
  }

  quickFind(req: Request, res: Response) {
    let query: any = {};
    let fields;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    if (req.headers.fields && typeof req.headers.fields === 'string') {
      fields = JSON.parse(req.headers.fields);
    }

    this.model.find(query, null, fields).then((x: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(x, null, 3));
    });
  }
};