import { Picture } from '../picture.model';
import { IMerchant } from '../merchant/merchant.model';
import { IAccount } from '../account/account.model';
import {ISpecification, Specification} from '../specification/specification.model';

export enum ProductStatus {
  ACTIVE = 1,
  INACTIVE,
  NEW,
  PROMOTE
}

export interface IProduct {
  _id?: string;
  name: string;
  nameEN: string;
  description?: string;
  price: number;
  cost?: number;
  merchantId: string;
  categoryId: string;

  openDays?: number[];
  restaurant?: IMerchant; // ??
  category?: ICategory;
  pictures?: Picture[];
  dow?: string[];
  order?: number;
  status?: ProductStatus;
  created?: string;
  modified?: string;

  merchant?: IMerchant; // join account table from find()
  merchantAccount?: IAccount; // join account table from find()
  specifications?: Array<ISpecification>;
}

export class Product implements IProduct {
  id: string;
  name: string;
  nameEN: string;
  description: string;
  price: number;
  cost?: number;
  merchantId: string;
  categoryId: string;
  pictures: Picture[];
  dow?: string[];
  order?: number;
  status?: ProductStatus;
  specifications?: Array<ISpecification>;
  constructor(data?: IProduct) {
    Object.assign(this, data);
  }
  static calcPrice(p: IProduct): number {
    let price = p.price;
    p.specifications.forEach(spec => {
      const defaultDetail = Specification.getDefaultDetail(spec);
      if (defaultDetail) {
        price += defaultDetail.price;
      }
    });
    return price;
  }
  static calcCost(p: IProduct): number {
    let cost = p.cost;
    p.specifications.forEach(spec => {
      const defaultDetail = Specification.getDefaultDetail(spec);
      if (defaultDetail) {
        cost += defaultDetail.cost;
      }
    });
    return cost;
  }
  singleSpecs(): Array<ISpecification> {
    if (!this.specifications) {
      return [];
    } else {
      return this.specifications.filter(spec => spec.type === 'single');
    }
  }
  multipleSpec(): Array<ISpecification> {
    if (!this.specifications) {
      return [];
    } else {
      return this.specifications.filter(spec => spec.type === 'multiple');
    }
  }
  priceIncSpec(): number {
    let price = this.price;
    if (this.specifications) {
      this.specifications.forEach(spec => {
        const defaultDetail = Specification.getDefaultDetail(spec);
        if (defaultDetail) {
          price += defaultDetail.price;
        }
      });
    }
    return price;
  }
  costIncSpec(): number {
    let cost = this.cost ? this.cost : 0;
    if (this.specifications) {
      this.specifications.forEach(spec => {
        const defaultDetail = Specification.getDefaultDetail(spec);
        if (defaultDetail) {
          cost += defaultDetail.cost;
        }
      });
    }
    return cost;
  }
}

export interface ICategory {
  name: string;
  nameEN: string;
  description?: string;
  created?: Date;
  modified?: Date;
  id?: string;
  order?: number;
}

export class Category implements ICategory {
  name: string;
  nameEN: string;
  description: string;
  created: Date;
  modified: Date;
  id: string;
  order?: number;
  constructor(data?: ICategory) {
    Object.assign(this, data);
  }
}
