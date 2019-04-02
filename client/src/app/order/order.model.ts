import { Product } from '../product/product.model';
// import { Picture } from '../picture.model';
import { Address } from '../account/account.model';
import { Restaurant } from '../restaurant/restaurant.model';
import { Picture } from '../picture.model';

export interface IOrder {
  clientId: number;
  username: string;
  restaurantId: string;
  workerId: string;
  status: string;
  clientStatus: string;
  workerStatus: string;
  restaurantStatus: string;
  notes?: string;
  address: string;
  delivered?: Date;
  created?: Date;
  modified?: Date;
  id?: number;
  account?: Account;
  restaurant?: Restaurant;
  items?: OrderItem[];
  deliveryAddress?: Address;
}

export class Order implements IOrder {
  clientId: number;
  username: string;
  restaurantId: string;
  workerId: string;
  status: string;
  clientStatus: string;
  workerStatus: string;
  restaurantStatus: string;
  notes: string;
  address: string;
  delivered: Date;
  created: Date;
  modified: Date;
  id: number;
  account: Account;
  restaurant: Restaurant;
  items: OrderItem[];
  deliveryAddress: Address;
  constructor(data?: IOrder) {
    Object.assign(this, data);
  }
}

export interface IOrderItem {
  price: number;
  quantity: number;
  orderId: number;
  productId: number;
  created?: Date;
  modified?: Date;
  id?: number;
  name: string;
  order?: Order;
  product?: Product;
}

export class OrderItem implements IOrderItem {
  price: number;
  quantity: number;
  orderId: number;
  productId: number;
  created: Date;
  modified: Date;
  id: number;
  name: string;
  order: Order;
  product: Product;
  constructor(data?: IOrderItem) {
    Object.assign(this, data);
  }
}


