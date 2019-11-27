import express from "express";
import { DB } from "../db";
import { DriverHour } from "../models/driver-hour";

export function DriverHourRouter(db: DB){
  const router = express.Router();
  const controller = new DriverHour(db);

  router.get('/qFind', (req, res) => { controller.quickFind(req, res); });
  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });

  // tools
  router.patch('/changeAccount', (req, res) => { controller.changeAccount(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  return router;
};