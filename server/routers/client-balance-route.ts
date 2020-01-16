// import express from "express";
// import { DB } from "../db";
// import { ClientBalance } from "../models/client-balance";

// export function ClientBalanceRouter(db: DB){
//   const router = express.Router();
//   const controller = new ClientBalance(db);

//   router.get('/qFind', (req, res) => { controller.quickFind(req, res); });
//   router.get('/', (req, res) => { controller.list(req, res); });
//   router.get('/:id', (req, res) => { controller.get(req, res); });
//   router.post('/', (req, res) => { controller.create(req, res); });
//   router.put('/', (req, res) => { controller.replace(req, res); });
//   router.patch('/', (req, res) => { controller.update(req, res); });
//   router.delete('/', (req, res) => { controller.remove(req, res); });
  
//   return router;
// };