import express from "express";
import { DB } from "../db";
import { Transaction } from "../models/transaction";

export function TransactionRouter(db: DB){
  const router = express.Router();
  const controller = new Transaction(db);

  router.get('/sales', (req, res) => { controller.getSales(req, res); });
  router.get('/cost', (req, res) => { controller.getCost(req, res); });
  router.get('/merchantPay', (req, res) => { controller.getMerchantPay(req, res); });
  router.get('/salary', (req, res) => { controller.getSalary(req, res); });

  router.get('/qFind', (req, res) => { controller.quickFind(req, res); });
  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });

  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });

  router.delete('/:id', (req, res) => { controller.removeOne(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  return router;
};