import express from "express";
import { DB } from "../db";
import { ClientPayment } from "../models/client-payment";

export function ClientPaymentRouter(db: DB){
  const router = express.Router();
  const controller = new ClientPayment(db);

  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  router.post('/', (req, res) => { controller.createAndUpdateBalance(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  router.post('/pay', (req, res) => { controller.pay(req, res); });
  return router;
};