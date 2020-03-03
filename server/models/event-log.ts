import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";
import { Request, Response } from "express";
import { IOrder } from "../models/order";
import { Account, IAccount } from "./account";
import moment from "moment";
import { resolve } from "url";


export interface IEventLog {
  _id?: string;
  accountId: string;
  type: string;
  code: string;
  decline_code: string; // from stripe
  message: string;
  account?: IAccount;
  created?: string;
}

export class EventLog extends Model {
  accountModel : Account;
  constructor(dbo: DB) {
    super(dbo, 'event_logs');
    this.accountModel = new Account(dbo);
  }

  list(req: Request, res: Response) {
    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    this.joinFind(query).then((rs: any) => {
      res.setHeader('Content-Type', 'application/json');
      if (rs) {
        res.send(JSON.stringify(rs, null, 3));
      } else {
        res.send(JSON.stringify(null, null, 3))
      }
    });
  }

  getLatest(logs: any[]){
    if(logs && logs.length > 0){
      if(logs.length > 1){
        let tmp = logs[0];
        for(let i=1; i<logs.length; i++){
          if(moment(tmp.created).isBefore(moment(logs[i].created))){
            tmp = logs[i];
          }
        }
        return tmp;
      }else{
        return logs[0];
      }
    }else{
      return null;
    }
  }

  groupBy(items: any[], key: string) {
    const groups: any = {};
    items.map(it => {
      const id = it[key].toString();
      const ids = Object.keys(groups);
      const found = ids.length === 0 ? null : ids.find(_id => _id === id);
      if (found) {
        groups[id].push(it);
      } else {
        groups[id] = [it];
      }
    });

    return groups;
  }


  joinFind(query: any): Promise<IOrder[]> {
    let q = query ? query : {};

    return new Promise((resolve, reject) => {
      this.accountModel.find({}).then(accounts => {
        this.find(q).then((rs: any) => {
          rs.map((r: any) => {
            if(r.accountId){
              const account = accounts.find((a: any) => a._id && r.accountId && a._id.toString() === r.accountId.toString());
              if(account){
                if(account.password){
                  delete account.password;
                }
                r.account = account;
              }
            }
          });
          resolve(rs);
        });
      });
    });
  }


  loadPage(req: Request, res: Response) {
    const itemsPerPage = +req.params.itemsPerPage;
    const currentPageNumber = +req.params.currentPageNumber;

    let query = null;
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }

    // if (query.hasOwnProperty('pickup')) {
    //   query.delivered = this.getPickupDateTime(query['pickup']);
    //   delete query.pickup;
    // }
    let q = query ? query : {};

    this.accountModel.find({}).then(accounts => {
      this.find(q).then((rs: IEventLog[]) => {
        rs.map((r: IEventLog) => {
          const account = accounts.find((a: IAccount) => a._id && r.accountId && a._id.toString() === r.accountId.toString());
          if(account){
            delete account.password;
          }
          r.account = account;
        });

        const arrSorted = rs.sort((a: any, b: any) => {
          const ca = moment(a.created);
          const cb = moment(b.created);
          if (ca.isAfter(cb)) {
            return -1;
          } else {
            return 1;
          }
        });

        const start = (currentPageNumber - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const len = arrSorted.length;
        const arr = arrSorted.slice(start, end);

        res.setHeader('Content-Type', 'application/json');
        if (arr && arr.length > 0) {
          res.send(JSON.stringify({ total: len, logs: arr }, null, 3));
        } else {
          res.send(JSON.stringify({ total: len, logs: [] }, null, 3));
        }
      });
    });
  }
}
