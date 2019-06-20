import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Config } from "./config";

export class ApiMiddleWare {
    constructor(options?: any) {

    }

    auth(req: Request, res: Response, next: any) {
        const token = req.get('Authentication');
        const cfg = new Config();
        if (token) {
            const payload = jwt.verify(token.toString(), cfg.JWT.SECRET);
        } else {
            return res.status(401).send("API Authentication token is required.");
        }
    }
}
