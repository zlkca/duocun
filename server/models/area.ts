import { DB } from "../db";
import { Model } from "./model";

export class Area extends Model{
  constructor(dbo: DB) {
		super(dbo, 'areas');
  }
}