import { Address } from '../account/account.model';
import { ILocation } from '../location/location.model';
import {CartItem, CartItemSpec, CartItemSpecDetail, ICartItemSpecDetail} from '../cart/cart.model';
import {IProduct} from "../product/product.model";

export enum OrderStatus {
  BAD = 1,          // client return, compansate
  DELETED,          // cancellation
  TEMP,             // generate a temp order for electronic order
  NEW,
  LOADED,           // The driver took the food from Merchant
  DONE,             // Finish delivery
  MERCHANT_CHECKED  // VIEWED BY MERCHANT
}

export enum PaymentStatus {
  UNPAID = 1,
  PAID
}

export const PaymentError = {
  NONE: 'N',
  PHONE_EMPTY: 'PE',
  LOCATION_EMPTY: 'LE',
  DUPLICATED_SUBMIT: 'DS',
  CART_EMPTY: 'CE',
  BANK_CARD_EMPTY: 'BE',
  INVALID_BANK_CARD: 'IB',
  BANK_CARD_FAIL: 'BF',
  WECHATPAY_FAIL: 'WF'
};

export const OrderType = {
  FOOD_DELIVERY: 'F',
  MOBILE_PLAN_SETUP: 'MS',
  MOBILE_PLAN_MONTHLY: 'MM'
};

export interface IOrderItemSpecDetail {
  name: string;
  nameEN?: string;
  price: number;
  cost: number;
  quantity: number;
}

class OrderItemSpecDetail extends CartItemSpecDetail implements IOrderItemSpecDetail  {}

export interface IOrderItemSpec {
  specId: string;
  specName: string;
  type: 'single' | 'multiple';
  list: Array<IOrderItemSpecDetail>;
}

class OrderItemSpec extends CartItemSpec implements IOrderItemSpec {}

export class OrderItem extends CartItem {
  product: IProduct;
  constructor(obj) {
    super(obj);
    this.product = obj.product;
  }
  static fromRawData(obj) {
    const instance = new OrderItem(CartItem.fromRawData(obj));
    instance.product = obj.product;
    return instance;
  }
}

export interface IOrder {
  _id?: string;
  code?: string;
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  // prepaidClient?: boolean;
  merchantId?: string;
  merchantName?: string;
  driverId?: string;
  driverName?: string;

  type?: string;       // in db
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;

  note?: string;
  // address?: string;       // should not in db
  location?: ILocation;

  items?: OrderItem[];
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
  // prepaidClient?: boolean;
  merchantId: string;
  merchantName: string;
  driverId?: string;
  driverName?: string;

  type?: string;      // in db
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;

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
  static fromRawData(obj): Order {
    const items = [];
    if (obj.items) {
      obj.items.forEach(item => {
        items.push(OrderItem.fromRawData(item));
      });
    }
    return new Order({...obj, items});
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
