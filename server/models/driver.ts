import { DB } from "../db";
import { Model } from "./model";

export class Driver extends Model {
  constructor(dbo: DB) {
    super(dbo, 'drivers');
  }
}