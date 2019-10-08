import { Picture } from '../picture.model';
import { Restaurant, IRestaurant } from '../restaurant/restaurant.model';

export interface IProduct {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price?: number;
  cost?: number;
  merchantId: string;
  categoryId: string;
  created?: Date;
  modified?: Date;
  openDays?: number[];
  restaurant?: IRestaurant;
  category?: ICategory;
  pictures?: Picture[];
  dow?: string[];
  order?: number;
  status?: string;
}

export class Product implements IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  merchantId: string;
  categoryId: string;
  created: Date;
  modified: Date;
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
