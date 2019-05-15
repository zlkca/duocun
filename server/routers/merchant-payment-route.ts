import express from "express";
import { DB } from "../db";
import { MerchantPayment } from "../models/merchant-payment";

export function MerchantPaymentRouter(db: DB){
  const router = express.Router();
  const controller = new MerchantPayment(db);

  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  router.post('/', (req, res) => { controller.createAndUpdateBalance(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  return router;
};