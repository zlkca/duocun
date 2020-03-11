// import { Picture } from '../picture.model';
import {IProduct} from '../product/product.model';

export interface ICartItemSpecDetail {
  name: string;
  nameEN?: string;
  price: number;
  cost: number;
  quantity: number;
}

export interface ICartItemSpec {
  specId: string;
  specName: string;
  type: 'single' | 'multiple';
  list: Array<ICartItemSpecDetail>;
}

export class CartItemSpec implements ICartItemSpec {
  specId: string;
  specName: string;
  type: 'single' | 'multiple';
  list: Array<ICartItemSpecDetail>;
  constructor(obj: ICartItemSpec) {
    Object.assign(this, obj);
  }
  static calcPrice(cartItemSpec: ICartItemSpec) {
    if (cartItemSpec.type !== 'single') {
      let subtotal = 0;
      cartItemSpec.list.forEach(itemSpecDetail => {
        subtotal += itemSpecDetail.price * itemSpecDetail.quantity;
      })
      return subtotal;
    } else {
      return cartItemSpec.list[0] ? cartItemSpec.list[0].price : 0;
    }
  }
}

export interface ICartItem {
  productId: string;
  productName: string; // product name
  // pictures: Picture[];
  merchantId: string;
  merchantName: string;
  price: number;
  cost: number;
  quantity: number;
  spec?: Array<ICartItemSpec>;
}

export class CartItem implements ICartItem {
  productId: string;
  productName: string; // product name
  // pictures: Picture[];
  merchantId: string;
  merchantName: string;
  price: number;
  cost: number;
  quantity: number;
  spec?: Array<ICartItemSpec>;
  constructor(obj: ICartItem) {
    Object.assign(this, obj);
  }
  static calcPrice(cartItem: ICartItem) {
    let price = cartItem.price;
    if (cartItem.spec) {
      cartItem.spec.forEach(spec => {
        price += CartItemSpec.calcPrice(spec);
      });
    }
    return price;
  }
  static calcSubtotal(cartItem: ICartItem) {
    return this.calcPrice(cartItem) * cartItem.quantity;
  }
}

export interface ICart {
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  merchantId: string;
  merchantName?: string;
  price?: number;
  quantity?: number;
  selectedProduct?: IProduct; // selected product for specification
  items: ICartItem[];
}
export class Cart implements ICart{
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  merchantId: string;
  merchantName?: string;
  price?: number;
  quantity?: number;
  selectedProduct?: IProduct; // selected product for specification
  items: ICartItem[];
  constructor(obj: ICart) {
    Object.assign(this, obj);
  }
}
