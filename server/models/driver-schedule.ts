import { DB } from "../db";
import { Model } from "./model";

export class DriverSchedule extends Model{
  constructor(dbo: DB) {
		super(dbo, 'driver_schedules');
  }
}