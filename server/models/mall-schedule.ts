import { DB } from "../db";
import { Model } from "./model";

export class MallSchedule extends Model{
  constructor(dbo: DB) {
		super(dbo, 'mall_schedules');
  }
}