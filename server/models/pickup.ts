import { DB } from "../db";
import { Model } from "./model";

export class Pickup extends Model {
  constructor(dbo: DB) {
    super(dbo, 'pickups');
  }
}