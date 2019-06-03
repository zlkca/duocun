import { DB } from "../db";
import { Model } from "./model";

export class Region extends Model{
  constructor(dbo: DB) {
		super(dbo, 'regions');
  }
}