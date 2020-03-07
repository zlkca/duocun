export interface ISepcificationList {
  name: string;
  nameEN?: string;
  price: number;
  cost: number;
}

export interface ISpecification {
  _id?: string;
  id?: string;
  productId: string;
  type: 'single' | 'multiple';
  name: string;
  nameEN?: string;
  list: Array<ISepcificationList>;
}

export class Specification implements ISpecification {
  _id?: string;
  id?: string;
  productId: string;
  type: 'single' | 'multiple';
  name: string;
  nameEN?: string;
  list: Array<ISepcificationList>;
  constructor(data: ISpecification) {
    Object.assign(this, data);
  }
}
