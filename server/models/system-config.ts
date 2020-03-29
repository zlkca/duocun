import { DB } from "../db";
import { Model } from "./model";

export class SystemConfig extends Model {
  constructor(dbo: DB) {
    super(dbo, 'system');
  }
}