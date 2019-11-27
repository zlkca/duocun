import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";

export class DriverHour extends Model {
  constructor(dbo: DB) {
    super(dbo, 'driver_hours');
  }

  // tools
  changeAccount(req: Request, res: Response) {
    this.find({ accountId: '5cf67ed1d47c19056aaa1091' }).then(trs1 => {
      const datas: any[] = [];
      trs1.map((t: any) => {
        datas.push({
          query: { _id: t._id },
          data: { accountId: '5ddda5edc792cdca1a13c1e2', accountName: 'bonnie2' }
        });
      });

      res.setHeader('Content-Type', 'application/json');
      if (datas && datas.length > 0) {
        this.bulkUpdate(datas).then(() => {
          res.end(JSON.stringify('success', null, 3));
        });
      } else {
        res.end(JSON.stringify(null, null, 3));
      }
    });
  }
}