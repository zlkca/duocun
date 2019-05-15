import { DB } from "../db";
import { Model } from "./model";

export class MerchantPayment extends Model{
  constructor(dbo: DB) {
		super(dbo, 'merchant_payments');
  }
}