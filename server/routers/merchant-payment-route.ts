import express from "express";
import { MerchantPayment } from "../models/merchant-payment";
import { DB } from "../db";

export function MerchantPaymentRouter(db: DB){
  const router = express.Router();
  const controller = new MerchantPayment(db);

  router.route('merchant-payments/')
    .get(controller.list)
    .post(controller.create)
    .put(controller.replace)
    .patch(controller.update)
    .delete(controller.remove);

  return router;
};