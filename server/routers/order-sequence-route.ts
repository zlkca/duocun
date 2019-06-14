import express from "express";
import { DB } from "../db";
import { OrderSequence } from "../models/order-sequence";

export function OrderSequenceRouter(db: DB) {
    const router = express.Router();
    const controller = new OrderSequence(db);

    router.get('/', (req, res) => { controller.generate(req, res); });
    // router.get('/', (req, res) => { controller.list(req, res); });
    // router.get('/:id', (req, res) => { controller.get(req, res); });
    // router.post('/', (req, res) => { controller.create(req, res); });
    // router.put('/', (req, res) => { controller.replace(req, res); });
    // router.patch('/', (req, res) => { controller.update(req, res); });
    // router.delete('/', (req, res) => { controller.remove(req, res); });
    // router.delete('/:id', (req, res) => { controller.removeOne(req, res); });

    return router;
};