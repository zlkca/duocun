import { DB } from "../db";
import { Model } from "./model";

export class Transaction extends Model{
  constructor(dbo: DB) {
		super(dbo, 'transactions');
  }
}