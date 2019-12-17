import { Picture } from '../picture.model';
import { Restaurant, IRestaurant } from '../restaurant/restaurant.model';
import { IAccount } from '../account/account.model';

export interface IProduct {
  _id?: string;
  name: string;
  nameEN: string;
  description?: string;
  price: number;
  cost?: number;
  merchantId: string;   // merchant account _id !
  categoryId: string;

  merchant?: IAccount; // join account table from find()

  openDays?: number[];
  restaurant?: IRestaurant; // ??
  category?: ICategory;
  pictures?: Picture[];
  dow?: string[];
  order?: number;
  status?: string;
  created?: string;
  modified?: string;
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
  status?: string;
  constructor(data?: IProduct) {
    Object.assign(this, data);
  }
}

export interface ICategory {
  name: string;
  description?: string;
  created?: Date;
  modified?: Date;
  id?: string;
  order?: number;
}

export class Category implements ICategory {
  name: string;
  description: string;
  created: Date;
  modified: Date;
  id: string;
  order?: number;
  constructor(data?: ICategory) {
    Object.assign(this, data);
  }
}
