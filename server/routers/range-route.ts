import express from "express";
import { Range } from "../models/range";
import { DB } from "../db";

export function RangeRouter(db: DB){
  const router = express.Router();
  const controller = new Range(db);


  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });

  router.post('/availables', (req, res) => {controller.findAvailablesReq(req, res)})
  router.post('/inRange', (req, res) => { controller.inDeliveryRangeReq(req, res); });
  router.post('/overRange', (req, res) => { controller.getOverRangeReq(req, res); });
  router.post('/', (req, res) => { controller.create(req, res); });

  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  return router;
};