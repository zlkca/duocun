import { Product } from '../product/product.model';
import { Picture } from '../picture.model';
import { Address } from '../account/account.model';
import { GeoPoint } from '../location/location.model';
import { Order } from '../order/order.model';


export interface IRestaurant {
  name: string;
  description?: string;
  location?: GeoPoint;
  ownerId?: string;
  mallId?: string;
  created?: Date;
  modified?: Date;
  closed?: Date[];
  dow?: string[]; // day of week opening
  isClosed?: boolean;
  id?: string;
  distance?: number;
  deliveryFee?: number;
  fullDeliveryFee?: number;
  products?: Product[];
  orders?: Order[];
  pictures?: Picture[];
  address?: Address;
}

// For database
export class Restaurant implements IRestaurant {
  name: string;
  description: string;
  location: GeoPoint;
  ownerId: string;
  mallId: string;
  created: Date;
  modified: Date;
  closed?: Date[];
  dow?: string[]; // day of week opening
  id: string;
  products: Product[];
  pictures: Picture[];
  address: Address;
  constructor(data?: IRestaurant) {
    Object.assign(this, data);
  }
}
