import express from "express";
import { DB } from "../db";
import { ClientPayment } from "../models/client-payment";

export function ClientPaymentRouter(db: DB){
  const router = express.Router();
  const controller = new ClientPayment(db);

  router.get('/session', (req, res) => {controller.createStripeSession(req, res); });
  // router.post('/checkout', (req, res) => {controller.checkout(req, res); });

  router.post('/stripeCreateCustomer', (req, res) => {controller.stripeCreateCustomer(req, res); });
  router.post('/stripeCharge', (req, res) => {controller.stripeCharge(req, res); });
  // router.post('/stripRefund', (req, res) => {controller.stripeRefund(req, res); });

  router.post('/snappayCharge', (req, res) => {controller.snappayCharge(req, res); });
  // router.post('/snappayRefund', (req, res) => {controller.snappayRefund(req, res); });

  router.post('/afterAddOrder', (req, res) => { controller.afterAddOrder(req, res); });
  router.post('/afterRemoveOrder', (req, res) => { controller.afterRemoveOrder(req, res); });
  router.post('/addGroupDiscount', (req, res) => { controller.reqAddGroupDiscount(req, res); });
  router.post('/removeGroupDiscount', (req, res) => { controller.reqRemoveGroupDiscount(req, res); });

  router.post('/pay', (req, res) => { controller.payOrder(req, res); });

  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  // router.post('/', (req, res) => { controller.createAndUpdateBalance(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });


  return router;
};