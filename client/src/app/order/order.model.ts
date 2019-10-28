import { Product } from '../product/product.model';
// import { Picture } from '../picture.model';
import { Address } from '../account/account.model';
import { Restaurant, IRestaurant } from '../restaurant/restaurant.model';
import { Picture } from '../picture.model';
import { ILocation } from '../location/location.model';

export interface IOrder {
  _id?: string;
  id?: string;
  code?: string;
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  // prepaidClient?: boolean;
  merchantId?: string;
  merchantName?: string;
  driverId?: string;
  driverName?: string;
  status?: string;
  note?: string;
  address?: string;
  location?: ILocation;

  items?: IOrderItem[];
  tax?: number;
  tips?: number;
  deliveryAddress?: Address;
  deliveryCost?: number;
  deliveryDiscount?: number;
  overRangeCharge?: number;
  groupDiscount?: number;
  productTotal?: number;
  total?: number;
  paymentMethod ?: string;
  chargeId?: string; // stripe chargeId
  transactionId?: string;
  payable?: number; // total - balance
  price?: number;
  cost?: number;

  defaultPickupTime?: string;
  deliveryDate?: string; // 'today', 'tomorrow'
  delivered?: Date;  // obsoleted
  created?: string;  // obsoleted
  modified?: string; // obsoleted
}

export class Order implements IOrder {
  id: string;
  code?: string;
  clientId: string;
  clientName: string;
  clientPhoneNumber?: string;
  // prepaidClient?: boolean;
  merchantId: string;
  merchantName: string;
  driverId?: string;
  driverName?: string;
  status: string;
  note: string;
  address: string;
  location?: ILocation;

  items: OrderItem[];
  deliveryAddress: Address;
  deliveryCost?: number;
  deliveryDiscount?: number;
  overRangeCharge?: number;
  groupDiscount?: number;
  total: number;
  tax?: number;
  tips?: number;
  paymentMethod ?: string;
  chargeId?: string; // stripe chargeId
  transactionId?: string;
  price?: number;
  cost?: number;

  delivered: Date;
  created: string;
  modified: string;

  constructor(data?: IOrder) {
    Object.assign(this, data);
  }
}

export interface IOrderItem {
  productId: string;
  productName?: string;
  merchantId?: string;
  merchantName?: string;
  price?: number;
  cost?: number;
  quantity: number;
}

export class OrderItem implements IOrderItem {
  productId: string;
  quantity: number;
  price?: number;
  cost?: number;
  constructor(data?: IOrderItem) {
    Object.assign(this, data);
  }
}

export interface ICharge {
  productTotal: number;
  deliveryCost: number;
  deliveryDiscount: number;
  overRangeCharge: number;
  groupDiscount: number;
  total: number;
  tax: number;
  tips: number;
}
