import express from "express";
import { DB } from "../db";
import { Account, AccountAttribute } from "../models/account";
import { MerchantStuff } from "../merchant-stuff";

export function AccountRouter(db: DB){
  const router = express.Router();
  const controller = new Account(db);
  const attrModel = new AccountAttribute(db);
  const merchantStuff = new MerchantStuff(db);

  router.get('/attributes', (req, res) => { attrModel.quickFind(req, res); });

  // v1
  router.get('/wechatLogin', (req, res) => { controller.wechatLogin(req, res); });

  // v2
  router.get('/wxLogin', (req, res) => { controller.reqWxLogin(req, res); });

  router.get('/qFind', (req, res) => { controller.quickFind(req, res); });
  router.get('/shortList', (req, res) => { controller.shortList(req, res); });
  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/current', (req, res) => { controller.getCurrentAccount(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  
  router.post('/', (req, res) => { controller.create(req, res); });
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  
  router.post('/sendClientMsg', (req, res) => { controller.sendClientMsg(req, res); });
  router.post('/verifyAndLogin', (req, res) => { controller.verifyAndLogin(req, res); });
  router.post('/verifyCode', (req, res) => { controller.verifyCode(req, res); });
  router.post('/sendVerifyMsg', (req, res) => { controller.sendVerifyMsg(req, res); });
  router.post('/applyMerchant', (req, res) => {merchantStuff.applyMerchant(req, res); });
  router.post('/getMerchantApplication', (req, res) => {merchantStuff.getApplication(req, res); });

  router.post('/login', (req, res) => { controller.login(req, res); });
  router.post('/loginByPhone', (req, res) => { controller.loginByPhone(req, res); });
  router.route('/signup').post((req, res) => {controller.signup(req, res); });


  return router;
};