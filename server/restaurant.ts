
import { DB } from "./db";
import { Entity } from "./entity";

export class Restaurant extends Entity{
  	constructor(dbo: DB) {
		super(dbo, 'restaurants');
	}
}