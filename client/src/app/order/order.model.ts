import { Address } from '../account/account.model';
import { ILocation } from '../location/location.model';
import {ICartItem} from "../cart/cart.model";

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

export interface IOrderItemSpec {
  specId: string;
  specName: string;
  type: 'single' | 'multiple';
  list: Array<IOrderItemSpecDetail>;
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
  static financialSummary(order: IOrder): {costIncSpec: number, priceIncSpec: number, cost: number, price: number} {
    const orderSummary = {
      costIncSpec: 0,
      priceIncSpec: 0,
      cost: 0,
      price: 0
    };
    order.items.forEach(orderItem => {
      const orderItemSummary = OrderItem.financialSummary(orderItem);
      orderSummary.cost = orderItem.cost * orderItem.quantity;
      orderSummary.price = orderItem.price * orderItem.quantity;
      orderSummary.costIncSpec = orderItemSummary.costIncSpec * orderItem.quantity;
      orderSummary.priceIncSpec = orderItemSummary.priceIncSpec * orderItem.quantity;
    });
    return orderSummary;
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
  spec?: Array<IOrderItemSpec>;
}

export class OrderItem implements IOrderItem {
  productId: string;
  quantity: number;
  price?: number;
  cost?: number;
  spec?: Array<IOrderItemSpec>;
  constructor(data?: IOrderItem) {
    Object.assign(this, data);
  }
  static financialSummary(orderItem: IOrderItem): {costIncSpec: number, priceIncSpec: number} {
    const summary = {
      costIncSpec: orderItem.cost,
      priceIncSpec: orderItem.price
    }
    if (orderItem.spec) {
      orderItem.spec.forEach(spec => {
        if (spec.list && spec.list.length) {
          spec.list.forEach(specDetail => {
            summary.costIncSpec += specDetail.cost;
            summary.priceIncSpec += specDetail.price;
          });
        }
      });
    }
    return summary;
  }
  static costIncSpec(orderItem: IOrderItem): number {
    let costIncSpec = orderItem.cost;
    if (orderItem.spec) {
      orderItem.spec.forEach(spec => {
        if (spec.list && spec.list.length) {
          spec.list.forEach(specDetail => {
            costIncSpec += specDetail.cost * specDetail.quantity;
          });
        }
      });
    }
    return costIncSpec;
  }
  static priceIncSpec(orderItem: IOrderItem): number {
    let priceIncSpec = orderItem.price;
    if (orderItem.spec) {
      orderItem.spec.forEach(spec => {
        if (spec.list && spec.list.length) {
          spec.list.forEach(specDetail => {
            priceIncSpec += specDetail.price * specDetail.quantity;
          });
        }
      });
    }
    return priceIncSpec;
  }
  static subTotalIncSpec(orderItem: IOrderItem): number {
    return this.priceIncSpec(orderItem) * orderItem.quantity;
  }
  static singleSpecDesc(orderItem: IOrderItem, local: string = 'en', glue: string = ' '): string {
    const singles = [];
    if (orderItem.spec) {
      const singleSpecs = orderItem.spec.filter(spec => spec.type === 'single');
      singleSpecs.forEach(spec => {
        if (spec.list && spec.list.length) {
          const detail = spec.list[0];
          let detailName = detail.name;
          if (local === 'en' && detail.nameEN) {
            detailName =  detail.nameEN
          }
          singles.push(detailName);
        }
      });
    }
    return singles.join(glue);
  }
  static multipleSpecDesc(orderItem: IOrderItem, local: string = 'en'): Array<object> {
    const multiples = [];
    if (orderItem.spec) {
      const multipleSpecs = orderItem.spec.filter(spec => spec.type === 'multiple');
      multipleSpecs.forEach(spec => {
        if (spec.list) {
          spec.list.forEach(detail => {
            let detailName = detail.name;
            if (local === 'en' && detail.nameEN) {
              detailName = detail.nameEN;
            }
            multiples.push({
              name: detailName,
              quantity: detail.quantity
            });
          });
        }
      });
    }
    return multiples;
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
