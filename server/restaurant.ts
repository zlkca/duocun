import { Db } from "mongodb";
import { Entity } from "./entity";

export class User extends Entity{
  	constructor(db: Db) {
		super(db, 'users');
	}
}