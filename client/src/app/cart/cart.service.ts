import { Injectable } from '@angular/core';
import { ICart, ICartItem } from './cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor() { }

  getCost(cart: ICart, overRangeCharge: number, groupDiscount: number) {
    let price = 0;
    let cost = 0;

    const items: ICartItem[] = [];
    if (cart.items && cart.items.length > 0) {
      cart.items.map(x => {
        price += x.price * x.quantity;
        cost += x.cost * x.quantity;
        items.push(x);
      });
    }

    const subTotal = price + cart.deliveryCost;
    const tax = Math.ceil(subTotal * 13) / 100;
    const tips = 0;
    const overRangeTotal = Math.round(overRangeCharge * 100) / 100;
    return {
      price: price,
      cost: cost,
      deliveryCost: cart.deliveryCost,
      deliveryDiscount: cart.deliveryCost,
      overRangeCharge: overRangeTotal,
      groupDiscount: groupDiscount,
      tips: tips,
      tax: tax,
      total: price + tax + tips - groupDiscount + overRangeTotal
    };
  }
}
