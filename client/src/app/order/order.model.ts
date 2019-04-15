import { Product } from '../product/product.model';
// import { Picture } from '../picture.model';
import { Address } from '../account/account.model';
import { Restaurant, IRestaurant } from '../restaurant/restaurant.model';
import { Picture } from '../picture.model';

export interface IOrder {
  id?: string;
  clientId: string;
  clientName: string;
  merchantId: string;
  merchantName: string;
  stuffId: string;
  status: string;
  clientStatus: string;
  workerStatus: string;
  merchantStatus: string;
  note?: string;
  address: string;
  delivered?: Date;
  created?: Date;
  modified?: Date;
  items?: IOrderItem[];
  deliveryAddress?: Address;
  deliveryFee?: number;
  deliveryDiscount?: number;
  total?: number;
}

export class Order implements IOrder {
  id: string;
  clientId: string;
  clientName: string;
  merchantId: string;
  merchantName: string;
  stuffId: string;
  status: string;
  clientStatus: string;
  workerStatus: string;
  merchantStatus: string;
  note: string;
  address: string;
  delivered: Date;
  created: Date;
  modified: Date;
  items: OrderItem[];
  deliveryAddress: Address;
  deliveryFee: number;
  deliveryDiscount: number;
  total: number;
  constructor(data?: IOrder) {
    Object.assign(this, data);
  }
}

export interface IOrderItem {
  id?: number;
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  price: number;
  quantity: number;
}

export class OrderItem implements IOrderItem {
  id: number;
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  price: number;
  quantity: number;
  constructor(data?: IOrderItem) {
    Object.assign(this, data);
  }
}

export interface IAmount {
  total?: number;
}
