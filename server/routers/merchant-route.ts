import express from "express";
import { DB } from "../db";
import { Merchant } from "../models/merchant";

export function MerchantRouter(db: DB){
  const router = express.Router();
  const controller = new Merchant(db);

  router.get('/getByAccountId', (req, res) => { controller.getByAccountId(req, res); });
  router.get('/qFind', (req, res) => { controller.quickFind(req, res); });
  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });

  router.post('/load', (req, res) => { controller.load(req, res); });

  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  return router;
};