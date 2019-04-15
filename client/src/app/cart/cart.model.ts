// import { Picture } from '../picture.model';

export interface ICartItem {
  productId: string;
  productName: string; // product name
  // pictures: Picture[];
  merchantId: string;
  merchantName: string;
  price: number;
  quantity: number;
}

export interface ICart {
  items: ICartItem[];
}
