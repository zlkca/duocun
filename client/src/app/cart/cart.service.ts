import { Injectable } from '@angular/core';
import {Cart, CartItem, CartItemSpec, CartItemSpecDetail, ICart, ICartItem} from './cart.model';
import {IProduct} from '../product/product.model';
import {Specification} from '../specification/specification.model';
import {IMerchant} from '../merchant/merchant.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor() { }

  static DEFAULT_CART = new Cart({
    merchantId: '',
    merchantName: '',
    quantity: 0,
    price: 0,
    items: []
  });

  static getDefaultCartItem(product: IProduct, restaurant: IMerchant, lang = 'en') {
    const defaultItem = new CartItem({
      productId: product._id,
      productName: product.name,
      merchantId: product.merchantId,
      merchantName: lang === 'en' ? restaurant.nameEN : restaurant.name,
      price: product.price,
      cost: product.cost,
      quantity: 1,
      spec: []
    });
    // set default specifications
    product.specifications.forEach(spec => {
      const defaultDetail = Specification.getDefaultDetail(spec);
      if (defaultDetail) {
        defaultItem.spec.push(new CartItemSpec({
          specId: spec._id,
          specName: spec.name,
          type: spec.type,
          list: [new CartItemSpecDetail({
            name: defaultDetail.name,
            nameEN: defaultDetail.nameEN,
            price: defaultDetail.price,
            cost: defaultDetail.cost,
          })]
        }));
      }
    });
    return defaultItem;
  }

}
