import { DB } from "../db";
import { Model } from "./model";

export class DriverHour extends Model {
  constructor(dbo: DB) {
    super(dbo, 'driver_hours');
  }
}