import { DB } from "../db";
import { Model } from "./model";

export class Mall extends Model {
  constructor(dbo: DB) {
    super(dbo, 'malls');
  }
}