import { DB } from "../db";
import { Model } from "./model";

export class Category extends Model {
  constructor(dbo: DB) {
    super(dbo, 'categories');
  }
}