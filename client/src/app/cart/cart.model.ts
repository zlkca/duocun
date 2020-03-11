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
  static calcCost(cartItemSpec: ICartItemSpec) {
    if (cartItemSpec.type !== 'single') {
      let subtotal = 0;
      cartItemSpec.list.forEach(itemSpecDetail => {
        subtotal += itemSpecDetail.cost * itemSpecDetail.quantity;
      })
      return subtotal;
    } else {
      return cartItemSpec.list[0] ? cartItemSpec.list[0].cost : 0;
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
  static calcCost(cartItem: ICartItem) {
    let cost = cartItem.price;
    if (cartItem.spec) {
      cartItem.spec.forEach(spec => {
        cost += CartItemSpec.calcCost(spec);
      });
    }
    return cost;
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
  static priceAndCost(cartItem: ICartItem): {price: number, cost: number} {
    const data = {
      price: cartItem.price,
      cost: cartItem.cost
    };
    if (cartItem.spec) {
      cartItem.spec.forEach(spec => {
        data.price += CartItemSpec.calcPrice(spec);
        data.cost += CartItemSpec.calcCost(spec);
      });
    }
    return data;
  }
  static calcSubtotal(cartItem: ICartItem) {
    return this.calcPrice(cartItem) * cartItem.quantity;
  }
  static singleSpecDetails(cartItem: ICartItem): Array<ICartItemSpecDetail> {
    const details = [];
    if (cartItem.spec) {
      cartItem.spec.forEach(spec => {
        if (spec.type === 'single' && spec.list && spec.list.length) {
          details.push(spec.list[0]);
        }
      });
    }
    return details;
  }
  static multipleSpecDetails(cartItem: ICartItem): Array<ICartItemSpecDetail> {
    const details = [];
    if (cartItem.spec) {
      cartItem.spec.forEach(spec => {
        if (spec.type === 'multiple' && spec.list && spec.list.length) {
          spec.list.forEach(detail => {
            details.push(detail);
          });
        }
      });
    }
    return details;
  }
  static singleSpecDesc(cartItem: ICartItem, local: string = 'en', glue: string = ' '): string {
    const singles = [];
    if (cartItem.spec) {
      const singleSpecs = cartItem.spec.filter(spec => spec.type === 'single');
      singleSpecs.forEach(spec => {
        if (spec.list && spec.list.length) {
          const detail = spec.list[0];
          let detailName = '';
          if (local === 'en') {
            detailName =  detail.nameEN || detail.name;
          } else {
            detailName =  detail.name;
          }
          singles.push(detailName);
        }
      });
    }
    return singles.join(glue);
  }
  static multipleSpecDesc(cartItem: ICartItem, local: string = 'en'): Array<object> {
    const multiples = [];
    if (cartItem.spec) {
      const multipleSpecs = cartItem.spec.filter(spec => spec.type === 'multiple');
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
