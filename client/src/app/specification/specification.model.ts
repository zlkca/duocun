export interface ISpecificationDetail {
  name: string;
  nameEN?: string;
  price: number;
  cost: number;
  default?: boolean;
}

class SpecificationDetail implements ISpecificationDetail {
  name: string;
  nameEN?: string;
  price: number;
  cost: number;
  default?: boolean;
  constructor(data: ISpecificationDetail) {
    Object.assign(this, data);
  }
  static isEqual(d: ISpecificationDetail, e: ISpecificationDetail): boolean {
    return d.name === e.name
      && d.price === e.price
      && d.cost === e.cost
      && d.default === e.default
      && d.nameEN === e.nameEN;
  }
  toString() {
    return `name: ${this.name} nameEN :${this.nameEN} price: ${this.price} cost: ${this.cost} default: ${this.default}`;
  }
  equal(that: ISpecificationDetail): boolean {
    return this.name === that.name
      && this.price === that.price
      && this.cost === that.cost
      && this.default === that.default
      && this.nameEN === that.nameEN;
  }
}

export interface ISpecification {
  _id?: string;
  id?: string;
  productId: string;
  type: 'single' | 'multiple';
  name: string;
  nameEN?: string;
  list: Array<ISpecificationDetail>;
}

export class Specification implements ISpecification {
  _id?: string;
  id?: string;
  productId: string;
  type: 'single' | 'multiple';
  name: string;
  nameEN?: string;
  list: Array<ISpecificationDetail>;
  constructor(data: ISpecification) {
    Object.assign(this, data);
  }

  static getDefaultDetail(spec: ISpecification): ISpecificationDetail|undefined {
    const defaultDetail = spec.list.find(detail => detail.default);
    if (defaultDetail) {
      return defaultDetail;
    }
    if (spec.type === 'single') {
      return spec.list[0];
    }
    return undefined;
  }
}
