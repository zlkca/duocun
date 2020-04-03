import { DB } from "../db";
import { Model } from "./model";
import { Request, Response } from "express";
import { Area } from "./area";
import moment from 'moment';

export class MerchantSchedule extends Model{
  areaModel: Area;
  constructor(dbo: DB) {
    super(dbo, 'merchant_schedules');
    this.areaModel = new Area(dbo);
  }

  // v1
  getAvailableSchedules(req: Request, res: Response) {
    let fields: any;
    let data: any;
    if (req.headers) {
      if (req.headers.data && typeof req.headers.data === 'string') {
        data = JSON.parse(req.headers.data);
      }
      if (req.headers.fields && typeof req.headers.fields === 'string') {
        fields = JSON.parse(req.headers.fields);
      }
    }
    
    const merchantId = data.merchantId;
    const location = data.location;

    this.areaModel.getMyArea(location).then(area => {
      if(area){
        const areaId = area._id.toString();
        this.find({merchantId, areaId}).then(mss =>{
          res.send(JSON.stringify(mss, null, 3));
        });
      }else{
        res.send(JSON.stringify(null, null, 3));
      }
    });
  }


  getAvailableMerchants(req: Request, res: Response) {
    let fields: any;
    let data: any;
    if (req.headers) {
      if (req.headers.data && typeof req.headers.data === 'string') {
        data = JSON.parse(req.headers.data);
      }
      if (req.headers.fields && typeof req.headers.fields === 'string') {
        fields = JSON.parse(req.headers.fields);
      }
    }
    
    const areaId = data.areaId;
    this.find({areaId}).then(mss =>{
      if(mss && mss.length > 0){
        const merchantIds = mss.map((ms: any) => ms.merchantId.toString());
        res.send(JSON.stringify(merchantIds, null, 3));
      }else{
        res.send(JSON.stringify(null, null, 3));
      }
    });
  }
}