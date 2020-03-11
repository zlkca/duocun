export interface ISpecificationDetail {
  name: string;
  nameEN?: string;
  price: number;
  cost: number;
  default?: boolean;
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

  static getDefaultDetail(spec: ISpecification): ISpecificationDetail {
    const defaultDetail = spec.list.find(detail => detail.default);
    if (defaultDetail) {
      return defaultDetail;
    }
    if (spec.type === 'single') {
      return spec.list[0];
    }
    return null;
  }

}
