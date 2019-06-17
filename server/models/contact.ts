import { DB } from "../db";
import { Model } from "./model";

export class Contact extends Model {
  constructor(dbo: DB) {
    super(dbo, 'contacts');
  }
}