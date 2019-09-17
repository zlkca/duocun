import { DB } from "../db";
import { Model } from "./model";

export class MerchantSchedule extends Model{
  constructor(dbo: DB) {
		super(dbo, 'merchant_schedules');
  }
}