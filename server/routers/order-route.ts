import express from "express";
import { DB } from "../db";
import { Order } from "../models/order";

export function OrderRouter(db: DB){
  const router = express.Router();
  const controller = new Order(db);

  // v2
  router.get('/v2/transactions', (req, res) => { controller.reqTransactions(req, res); });
  // tools
  router.post('/missingWechatpayments', (req, res) => { controller.reqMissingWechatPayments(req, res); });
  router.post('/missingPaid', (req, res) => { controller.reqFixMissingPaid(req, res); });
  router.post('/missingUnpaid', (req, res) => { controller.reqFixMissingUnpaid(req, res); });
  
  // v1
  router.get('/csv', (req, res) => { controller.reqCSV(req, res); });
  router.get('/clients', (req, res) => { controller.reqClients(req, res); });
  router.get('/statisticsByClient', (req, res) => { controller.reqStatisticsByClient(req, res); });
  router.get('/latestViewed', (req, res) => { controller.reqLatestViewed(req, res); });
  router.get('/loadPage/:currentPageNumber/:itemsPerPage', (req, res) => { controller.loadPage(req, res); });
  router.get('/trends', (req, res) => { controller.getOrderTrends(req, res); });
  router.get('/qFind', (req, res) => { controller.quickFind(req, res); });
  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });

  router.put('/updatePurchaseTag', (req, res) => { controller.updatePurchaseTag(req, res)});
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.post('/checkStripePay', (req, res) => { controller.checkStripePay(req, res); });
  router.post('/checkWechatpay', (req, res) => { controller.checkWechatpay(req, res); });
  router.post('/bulk', (req, res) => { controller.reqPlaceOrders(req, res); });
  router.post('/payOrder', (req, res) => { controller.payOrder(req, res); });
  router.post('/', (req, res) => { controller.create(req, res); });


  // deprecated
  // router.post('/afterRemoveOrder', (req, res) => { controller.afterRemoveOrder(req, res); });

  router.patch('/fixCancelledTransaction', (req, res) => { controller.fixCancelledTransaction(req, res); });
  router.patch('/updateDelivered', (req, res) => { controller.updateDeliveryTime(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });
  router.delete('/:id', (req, res) => { controller.removeOrder(req, res); });

  // router.post('/checkGroupDiscount', (req, res) => { controller.checkGroupDiscount(req, res); });


  return router;
};