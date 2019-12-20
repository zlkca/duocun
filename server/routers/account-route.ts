import express from "express";
import { DB } from "../db";
import { Account } from "../models/account";
import { MerchantStuff } from "../merchant-stuff";

export function AccountRouter(db: DB){
  const router = express.Router();
  const controller = new Account(db);
  const merchantStuff = new MerchantStuff(db);

  router.get('/wechatLogin', (req, res) => { controller.wechatLogin(req, res); });

  router.get('/qFind', (req, res) => { controller.quickFind(req, res); });
  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/current', (req, res) => { controller.getCurrentAccount(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  
  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  router.post('/applyMerchant', (req, res) => {merchantStuff.applyMerchant(req, res); });
  router.post('/getMerchantApplication', (req, res) => {merchantStuff.getApplication(req, res); });

  router.post('/login', (req, res) => { controller.login(req, res); });
  router.route('/signup').post((req, res) => {controller.signup(req, res); });


  return router;
};