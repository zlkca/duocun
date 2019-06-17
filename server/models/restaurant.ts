import { DB } from "../db";
import { Model } from "./model";

export class Restaurant extends Model {
  constructor(dbo: DB) {
    super(dbo, 'restaurants');
  }
}