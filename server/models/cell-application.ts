import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Product, IProduct } from "./product";
import { Account, IAccount } from "./account";
import { IncomingMessage } from "http";
import https from 'https';
import fs from "fs";
import path from "path";
import {createObjectCsvWriter} from 'csv-writer';
import { IMerchant, Merchant } from "./merchant";

const ApplicationStatus = [
  {code: 1, text: 'APPLIED'},    // submit application form but didn't submit setup fee page
  {code: 2, text: 'ORDERED'},    // submit setup fee page but unpaid
  {code: 3, text: 'SETUP_PAID'}, // paid setup fee
  {code: 4, text: 'STARTED'},    // start to charge monthly fee
  {code: 5, text: 'STOPPED'},    // start to charge monthly fee
];

const carriers = [
  { code: 1, name: 'Bell' },
  { code: 2, name: 'Rogers' },
  { code: 3, name: 'Telus' },
  { code: 4, name: 'Fido' },
  { code: 5, name: 'Freedom Mobile' },
  { code: 6, name: 'Koodo Mobile' },
  { code: 7, name: 'Public Mobile' },
  { code: 8, name: 'Virgin Mobile' },
  { code: 9, name: 'Chatr Wireless' },
  { code: 10, name: 'SimplyConnect' },
  { code: 11, name: 'Lucky Mobile' },
  { code: 12, name: 'SaskTel' },
  { code: 13, name: '7-Eleven SpeakOut' },
  { code: 14, name: 'Videotron' },
  { code: 15, name: 'Cityfone' },
  { code: 16, name: 'Petro Canada' },
  { code: 17, name: 'PC Mobile' },
  { code: 30, name: 'Others' },
];

export enum CellApplicationStatus {
  APPLIED = 1,    // submit application form but didn't submit setup fee page
  ORDERED,        // submit setup fee page but unpaid
  SETUP_PAID,     // paid setup fee
  STARTED,          // start to charge monthly fee
  STOPPED,          // start to charge monthly fee
}

export interface ICellApplication {
  _id?: string;
  accountId: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  productId: string;
  product: IProduct;
  
  carrier: number;
  status: CellApplicationStatus;
  created?: string;
  modified?: string;

  account?: IAccount;
  merchant?: IMerchant;
}

export class CellApplication extends Model {
  productModel: Product;
  accountModel: Account;
  merchantModel: Merchant;

  constructor(dbo: DB) {
    super(dbo, 'cell_applications');
    this.productModel = new Product(dbo);
    this.accountModel = new Account(dbo);
    this.merchantModel = new Merchant(dbo);
  }

  list(req: Request, res: Response) {
    let query = {};
    if (req.headers && req.headers.filter && typeof req.headers.filter === 'string') {
      query = (req.headers && req.headers.filter) ? JSON.parse(req.headers.filter) : null;
    }
    this.joinFind(query).then(cas => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(cas, null, 3));
    });
  }

  joinFind(query: any): Promise<ICellApplication[]> {
    let q = query ? query : {};

    return new Promise((resolve, reject) => {
      this.accountModel.find({}).then(accounts => {
        this.merchantModel.find({}).then(merchants => {
          this.productModel.find({}).then(ps => {
            this.find(q).then((cas: any) => {
              cas.map((ca: any) => {
                const account = accounts.find((a: any) => a._id && ca.accountId && a._id.toString() === ca.accountId.toString());
                if(account && account.password){
                  delete account.password;
                }
                ca.account = account;
                ca.product = ps.find((p: any) => p._id && ca.productId && p._id.toString() === ca.productId.toString());
                if(ca.product){
                  const mId = ca.product.merchantId;
                  ca.merchant = merchants.find((m: any) => m._id && mId && m._id.toString() === mId.toString());
                }
              });
  
              resolve(cas);
            });
          });
        });
        
      });
    });
  }

  reqCSV(req: Request, res: Response) {
    const path = '../a.csv';

    const cw = createObjectCsvWriter({
      path: path,
      header: [
        {id: 'product', title: 'Product'},
        {id: 'client', title: 'Client'},
        {id: 'phone', title: 'Phone Number'},
        {id: 'carrier', title: 'Original Carrier'},
        {id: 'status', title: 'Status'},
      ]
    });
    const data: any[] = [];
    this.joinFind({}).then((cas: ICellApplication[]) => {
      cas.map(ca => {
        const s = ApplicationStatus.find(a => a.code === ca.status);
        const c = carriers.find(c => c.code === ca.carrier);
        data.push({
          product: ca.product.name,
          client: ca.firstName + ' ' + ca.lastName,
          phone: ca.phone,
          carrier: c ? c.name : 'N/A',
          status: s ? s.text : ca.status
        });
      });


      cw.writeRecords(data).then(()=> {
        res.download(path);
        console.log('The CSV file was written successfully');
      });
    });

    // const fileStream = fs.createReadStream(path);
    // this.cfg = JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
    // https.get(url, (res1: IncomingMessage) => {
      const filename = 'a.csv'; // path.basename(path);
      // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      // res.setHeader('Content-type', 'csv');
      // fileStream.pipe(res);
      
      // res1.on('data', (d) => {
      //   data += d;
      // });

      // res1.on('end', (rr: any) => {
      //   // console.log('receiving done!');
      //   if (data) {
      //     const s = JSON.parse(data);
      //     if (s.predictions && s.predictions.length > 0) {
      //       res.send(s.predictions);
      //     } else {
      //       res.send([]);
      //     }
      //   } else {
      //     res.send([]);
      //   }
      // });
    // });
  }
}