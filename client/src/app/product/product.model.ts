import { Picture } from '../picture.model';
import { Restaurant } from '../restaurant/restaurant.model';

export interface IProduct {
  name: string;
  description?: string;
  price: number;
  restaurantId: number;
  categoryId: number;
  created?: Date;
  modified?: Date;
  id?: number;
  owner?: Restaurant;
  restaurant?: Restaurant;
  category?: Category;
  pictures?: Picture[];
}

export class Product implements IProduct {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  restaurantId: number;
  created: Date;
  modified: Date;
  id: number;
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
  id?: number;
  products?: Product[];
}

export class Category implements ICategory {
  name: string;
  description: string;
  created: Date;
  modified: Date;
  id: number;
  products: Product[];
  constructor(data?: ICategory) {
    Object.assign(this, data);
  }
}
