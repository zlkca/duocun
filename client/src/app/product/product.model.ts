import { Picture } from '../picture.model';
import { IMerchant } from '../merchant/merchant.model';
import { IAccount } from '../account/account.model';

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
  constructor(data?: IProduct) {
    Object.assign(this, data);
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
