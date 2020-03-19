import express from "express";
import { DB } from "../db";
import { ClientPayment } from "../models/client-payment";

export function ClientPaymentRouter(db: DB){
  const router = express.Router();
  const controller = new ClientPayment(db);

  // v2 api
  router.post('/payByCreditCard', (req, res) => {controller.payByCreditCard(req, res); });
  router.post('/payBySnappay', (req, res) => {controller.payBySnappay(req, res)});

  router.get('/session', (req, res) => {controller.createStripeSession(req, res); });
  // router.post('/checkout', (req, res) => {controller.checkout(req, res); });

  // deprecated
  router.post('/stripeCreateCustomer', (req, res) => {controller.stripeCreateCustomer(req, res); });
  router.post('/stripePayOrder', (req, res) => {controller.stripePayOrder(req, res); });
  router.post('/stripeAddCredit', (req, res) => {controller.stripeAddCredit(req, res); });
  // router.post('/stripRefund', (req, res) => {controller.stripeRefund(req, res); });


  router.post('/snappayAddCredit', (req, res) => { controller.snappayAddCredit(req, res); });
  router.post('/snappayNotify', (req, res) => {controller.snappayNotify(req, res); });
  router.post('/snappayPayOrder', (req, res) => {controller.snappayPayOrder(req, res); });
  // router.post('/snappayRefund', (req, res) => {controller.snappayRefund(req, res); });


  // router.post('/addGroupDiscount', (req, res) => { controller.reqAddGroupDiscount(req, res); });
  // router.post('/removeGroupDiscount', (req, res) => { controller.reqRemoveGroupDiscount(req, res); });


  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  // router.post('/', (req, res) => { controller.createAndUpdateBalance(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });


  return router;
};