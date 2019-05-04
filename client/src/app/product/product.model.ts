import { Picture } from '../picture.model';
import { Restaurant, IRestaurant } from '../restaurant/restaurant.model';

export interface IProduct {
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
  category?: Category;
  pictures?: Picture[];
  dow?: string[];
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
  // owner: Restaurant;
  // restaurant: Restaurant;
  category: Category;
  pictures: Picture[];
  dow?: string[];
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
  // products?: Product[];
}

export class Category implements ICategory {
  name: string;
  description: string;
  created: Date;
  modified: Date;
  id: string;
  // products: Product[];
  constructor(data?: ICategory) {
    Object.assign(this, data);
  }
}
