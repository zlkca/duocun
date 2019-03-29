import { Product } from '../product/product.model';
import { Picture } from '../picture.model';
import { Address } from '../account/account.model';
import { GeoPoint } from '../location/location.model';
import { Order } from '../order/order.model';


export interface IRestaurant {
  name: string;
  description?: string;
  location?: GeoPoint;
  ownerId?: number;
  created?: Date;
  modified?: Date;
  id?: number;
  delivery_fee?: number;
  distance?: number;
  products?: Product[];
  orders?: Order[];
  pictures?: Picture[];
  address?: Address;
}

export class Restaurant implements IRestaurant {
  name: string;
  description: string;
  location: GeoPoint;
  ownerId: number;
  created: Date;
  modified: Date;
  id: number;
  delivery_fee: number;
  distance: number;
  products: Product[];
  orders: Order[];
  pictures: Picture[];
  address: Address;
  constructor(data?: IRestaurant) {
    Object.assign(this, data);
  }
}
