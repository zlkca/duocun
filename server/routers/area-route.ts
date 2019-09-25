import express from "express";
import { Area } from "../models/area";
import { DB } from "../db";

export function AreaRouter(db: DB) {
  const router = express.Router();
  const controller = new Area(db);

  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });

  router.post('/nearest', (req, res) => {controller.getNearest(req, res); });

  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  return router;
};