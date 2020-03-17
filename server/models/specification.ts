import { DB } from "../db";
import { Model } from "./model";
import { ObjectID } from "mongodb";

export interface ISpecificationDetail {
  name: string,
  nameEN?: string,
  description?: string,
  price: number,
  cost: number
}


export interface ISpecification {
  _id: ObjectID,
  productId: ObjectID,
  type: "single" | "multiple",
  name: string,
  nameEN?: string,
  list: Array<ISpecificationDetail>
}

export class Specification extends Model  {

  constructor(dbo: DB) {
    super(dbo, 'specifications');
  }
}
