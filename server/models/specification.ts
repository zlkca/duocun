import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";

export interface SpecificationDetailInterface {
  name: string,
  nameEN?: string,
  description?: string,
  price: number,
  cost: number
}


export interface SpecificationInterface {
  _id: ObjectID,
  productId: ObjectID,
  type: "single" | "multiple",
  name: string,
  nameEN?: string,
  list: Array<SpecificationDetailInterface>
}

export class Specification extends Model {

  constructor(dbo: DB) {
    super(dbo, 'specifications');
  }
}
