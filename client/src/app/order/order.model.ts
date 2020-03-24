import { Address } from '../account/account.model';
import { ILocation } from '../location/location.model';

export const OrderType = {
  FOOD_DELIVERY: 'F',
  MOBILE_PLAN_SETUP: 'MS',
  MOBILE_PLAN_MONTHLY: 'MM',
  GROCERY: 'G'
};

export const OrderStatus = {
  BAD:     'B',          // client return, compansate
  DELETED: 'D',          // cancellation
  TEMP:    'T',             // generate a temp order for electronic order
  NEW:     'N',
  LOADED:  'L',           // The driver took the food from Merchant
  DONE:    'F',             // Finish delivery
  MERCHANT_CHECKED: 'MC'  // VIEWED BY MERCHANT
};

export interface IOrder {
  _id?: string;
  code?: string;
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  merchantId?: string;
  merchantName?: string;
  driverId?: string;
  driverName?: string;

  type?: string;       // in db
  status?: string;
  paymentStatus?: string;

  pickupTime?: string;
  deliverDate?: string;   // eg. 2025-01-03
  deliverTime?: string;   // eg. 14:00:01

  note?: string;
  // address?: string;       // should not in db
  location?: ILocation;

  items?: IOrderItem[];
  tax?: number;
  tips?: number;
  deliveryAddress?: Address;
  deliveryCost?: number;
  deliveryDiscount?: number;
  overRangeCharge?: number;
  groupDiscount?: number;
  total?: number;
  paymentMethod ?: string;
  chargeId?: string; // stripe chargeId
  transactionId?: string;
  payable?: number; // total - balance
  price?: number;
  cost?: number;
  orderType?: string;

  defaultPickupTime?: string;
  dateType?: string; // 'today', 'tomorrow'
  delivered?: Date;  // obsoleted
  created?: string;  // obsoleted
  modified?: string; // obsoleted
}

export class Order implements IOrder {
  _id: string;
  code?: string;
  clientId: string;
  clientName: string;
  clientPhoneNumber?: string;
  merchantId: string;
  merchantName: string;
  driverId?: string;
  driverName?: string;

  type?: string;      // in db
  status?: string;
  paymentStatus?: string;

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
  price: number;
  cost: number;
  deliveryCost: number;
  deliveryDiscount: number;
  overRangeCharge: number;
  groupDiscount: number;
  total: number;
  tax: number;
  tips: number;
}
