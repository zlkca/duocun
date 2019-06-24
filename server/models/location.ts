import { DB } from "../db";
import { Model } from "./model";

export class Location extends Model {
  constructor(dbo: DB) {
    super(dbo, 'locations');
  }
}