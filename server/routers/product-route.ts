import express from "express";
import { DB } from "../db";
import { Product } from "../models/product";

export function ProductRouter(db: DB){
  const router = express.Router();
  const controller = new Product(db);

  router.get('/qFind', (req, res) => { controller.quickFind(req, res); });
  router.get('/clearImage', (req, res) => { controller.clearImage(req, res); });
  router.get('/categorize', (req, res) => { controller.categorize(req, res); });
  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  return router;
};