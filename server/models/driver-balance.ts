import { DB } from "../db";
import { Model } from "./model";

export class DriverBalance extends Model {
  constructor(dbo: DB) {
    super(dbo, 'driver_balances');
  }
}