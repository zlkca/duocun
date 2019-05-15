import { DB } from "../db";
import { Model } from "./model";

export class ClientBalance extends Model{
  constructor(dbo: DB) {
		super(dbo, 'client_balances');
  }
}