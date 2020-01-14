import express from "express";
import { DB } from "../db";
import { Contact } from "../models/contact";

export function ContactRouter(db: DB){
  const router = express.Router();
  const controller = new Contact(db);

  
  router.get('/movePhoneToAccount', (req, res) => { controller.movePhoneToAccount(req, res); });
  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });

  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  return router;
};