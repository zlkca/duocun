import { DB } from "../db";
import { Model } from "./model";

export class ClientPayment extends Model{
  constructor(dbo: DB) {
		super(dbo, 'client_payments');
  }
}