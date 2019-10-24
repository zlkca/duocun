import express from "express";
import { DB } from "../db";
import { Order } from "../models/order";

export function OrderRouter(db: DB){
  const router = express.Router();
  const controller = new Order(db);

  router.get('/qFind', (req, res) => { controller.quickFind(req, res); });
  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });

  
  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });
  router.delete('/:id', (req, res) => { controller.removeOrder(req, res); });

  router.post('/checkGroupDiscount', (req, res) => { controller.checkGroupDiscount(req, res); });

  return router;
};