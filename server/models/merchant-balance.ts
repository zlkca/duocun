import { DB } from "../db";
import { Model } from "./model";

export class MerchantBalance extends Model{
  constructor(dbo: DB) {
		super(dbo, 'merchant_balances');
  }
}