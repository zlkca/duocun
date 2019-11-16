import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Config } from "./config";

export class ApiMiddleWare {
    constructor(options?: any) {

    }

    auth(req: Request, res: Response, next: any) {
      const token = req.get('Authorization');

      if(req.path === '/api/Accounts/wechatLogin' || req.path === '/api/Accounts/login'
        || req.path === '/api/Accounts/signup' || req.path === '/api/Accounts/logout'
        || req.path === '/api/ClientPayments/snappayNotify'
        || req.path.includes('.jpeg') || req.path.includes('.jpg') || req.path.includes('.png')){
        next();
      }else{
        const cfg = new Config();
        if (token) {
          try {
            const accountId = jwt.verify(token, cfg.JWT.SECRET);
            // TODO: compare redis token
            if(accountId){
              next();
            }else{
              return res.status(401).send("Authorization: bad token");
            }
          } catch (err) {
            return res.status(401).send("Authorization: bad token err=" + err);
          }
            
        } else {
            return res.status(401).send("API Authorization token is required.");
        }
      }
    }
}
