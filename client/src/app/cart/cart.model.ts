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
