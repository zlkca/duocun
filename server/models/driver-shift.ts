import { DB } from "../db";
import { Model } from "./model";

export class DriverShift extends Model {
  constructor(dbo: DB) {
    super(dbo, 'driver_shifts');
  }
}