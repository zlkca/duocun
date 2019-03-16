
import { DB } from "./db";
import { Entity } from "./entity";

export class User extends Entity{
  	constructor(db: DB) {
		super(db, 'restaurants');
	}
}