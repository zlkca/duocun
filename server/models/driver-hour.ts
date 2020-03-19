import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";

export class DriverHour extends Model {
  constructor(dbo: DB) {
    super(dbo, 'driver_hours');
  }

  // tools
  changeAccount(req: Request, res: Response) {
    this.find({ accountId: '5cad44629687ac4a075e2f42' }).then(trs1 => {
      const datas: any[] = [];
      trs1.map((t: any) => {
        datas.push({
          query: { _id: t._id },
          data: { accountId: '5de520d9dfb6771fe8ea0f60', accountName: 'li2' }
        });
      });

      res.setHeader('Content-Type', 'application/json');
      if (datas && datas.length > 0) {
        this.bulkUpdate(datas).then(() => {
          res.send(JSON.stringify('success', null, 3));
        });
      } else {
        res.send(JSON.stringify(null, null, 3));
      }
    });
  }
}