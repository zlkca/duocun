import { DB } from "../db";
import { Model } from "./model";

export class Range extends Model {
  constructor(dbo: DB) {
    super(dbo, 'ranges');
  }
}