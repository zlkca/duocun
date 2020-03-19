import express from "express";
import { DB } from "../db";
import { Location } from "../models/location";

export function LocationRouter(db: DB){
  const router = express.Router();
  const controller = new Location(db);

  router.get('/suggest/:keyword', (req, res) => { controller.reqSuggestAddressList(req, res)});
  router.get('/history', (req, res) => { controller.reqHistoryAddressList(req, res)});
  router.get('/query', (req, res) => { controller.reqLocation(req, res)});

  router.get('/', (req, res) => { controller.list(req, res); });
  router.get('/:id', (req, res) => { controller.get(req, res); });
  router.get('/Places/:input', (req, res) => { controller.reqPlaces(req, res); });

  router.get('/Geocodes/:address', (req, res) => { controller.reqGeocodes(req, res); });
  router.post('/upsertOne', (req, res) => { controller.upsertOne(req, res); });
  router.post('/', (req, res) => { controller.create(req, res); });


  router.put('/updateLocations', (req, res) => { controller.updateLocations(req, res)});
  router.put('/', (req, res) => { controller.replace(req, res); });
  router.patch('/', (req, res) => { controller.update(req, res); });
  router.delete('/', (req, res) => { controller.remove(req, res); });

  return router;
};