import { Picture } from '../picture.model';
import { Restaurant } from '../restaurant/restaurant.model';

export interface IProduct {
  name: string;
  description?: string;
  price: number;
  merchantId: string;
  categoryId: string;
  created?: Date;
  modified?: Date;
  id?: string;
  openDays?: number[];
  restaurant?: Restaurant;
  category?: Category;
  pictures?: Picture[];
}

export class Product implements IProduct {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  merchantId: string;
  created: Date;
  modified: Date;
  id: string;
  owner: Restaurant;
  restaurant: Restaurant;
  category: Category;
  pictures: Picture[];
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
  products?: Product[];
}

export class Category implements ICategory {
  name: string;
  description: string;
  created: Date;
  modified: Date;
  id: string;
  products: Product[];
  constructor(data?: ICategory) {
    Object.assign(this, data);
  }
}
