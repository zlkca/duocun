import express from "express";
import { DB } from "../db";
import { Phone } from "../models/phone";

export function PhoneRouter(db: DB){
  const router = express.Router();
  const controller = new Phone(db);

  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  router.post('/smsverify', (req, res) => { controller.verifyCode(req, res); });
  router.post('/sendVerifyMsg', (req, res) => { controller.sendVerificationMessage(req, res); });

  // app.post('/' + ROUTE_PREFIX + '/smsverify', (req, res) => {
  //   phone.verifyCode(req, res);
  // });
  // app.post('/' + ROUTE_PREFIX + '/sendVerifyMsg', (req, res) => {
  //   phone.sendVerificationMessage(req, res);
  // });
  return router;
};